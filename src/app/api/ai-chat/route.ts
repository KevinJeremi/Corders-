import { NextRequest, NextResponse } from 'next/server';

// Kolosal AI Configuration - Use environment variable
const API_KEY = process.env.KOLOSAL_API_KEY;
const API_BASE_URL = "https://api.kolosal.ai";
const MODEL_ID = "meta-llama/llama-4-maverick-17b-128e-instruct";

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function POST(req: NextRequest) {
    // Validate API key is configured
    if (!API_KEY) {
        console.error('KOLOSAL_API_KEY environment variable is not set');
        return NextResponse.json(
            { error: 'AI service not configured. Please set KOLOSAL_API_KEY environment variable.' },
            { status: 503 }
        );
    }

    try {
        const { messages, analyticsContext } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
        }

        // Build system prompt with analytics context
        const systemPrompt = `Kamu adalah AI Assistant untuk CCTV Analytics Dashboard. 
Kamu membantu menganalisis data monitoring CCTV dan memberikan insight.

${analyticsContext ? `
Konteks Data Real-time:
- Total Kamera Aktif: ${analyticsContext.activeCameras}
- Total Orang Terdeteksi: ${analyticsContext.totalPeople}
- Total Alert: ${analyticsContext.totalAlerts}
- Waktu Update Terakhir: ${analyticsContext.lastUpdate}

Data Per Kamera:
${analyticsContext.feeds?.map((f: any) => `- ${f.name} (${f.location}): ${f.peopleCount || 0} orang`).join('\n') || 'Tidak ada data'}
` : ''}

Berikan jawaban yang informatif, singkat, dan membantu dalam bahasa Indonesia.
Jika ditanya tentang analisis, berikan insight berdasarkan data yang tersedia.`;

        // Prepare messages with system prompt
        const fullMessages: Message[] = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // Call Kolosal AI API
        const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: fullMessages,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Kolosal API Error:', errorText);
            return NextResponse.json(
                { error: 'AI service error' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Extract assistant message
        const assistantMessage = data.choices?.[0]?.message?.content || 'Maaf, tidak dapat menghasilkan respons.';
        const usage = data.usage || {};

        return NextResponse.json({
            success: true,
            message: assistantMessage,
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens,
            },
            model: data.model,
        });

    } catch (error: any) {
        console.error('AI Chat error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process chat' },
            { status: 500 }
        );
    }
}
