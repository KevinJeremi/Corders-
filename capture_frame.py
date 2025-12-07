
import sys
import cv2
import yt_dlp

def capture_frame(youtube_url, output_path):
    ydl_opts = {
        'format': 'best[height<=720]',
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            stream_url = info['url']
            
            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                print("ERROR: Cannot open stream")
                return False
            
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                cv2.imwrite(output_path, frame)
                print("SUCCESS")
                return True
            else:
                print("ERROR: Cannot read frame")
                return False
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    capture_frame("https://www.youtube.com/watch?v=NscyTzvTjHE", "D:\\Website Orders\\Corders\\temp_frame.jpg")
