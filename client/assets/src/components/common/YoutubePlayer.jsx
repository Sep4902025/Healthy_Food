// Import thư viện React và hook useState để quản lý trạng thái
import React, { useState } from "react";
// Import các component cần thiết từ React Native
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
// Import component WebView để nhúng nội dung web
import { WebView } from "react-native-webview";
// Import hàm tiện ích từ expo-linking để xử lý URL
import * as Linking from "expo-linking";

// Component YouTubePlayer - hiển thị video YouTube với thumbnail và chức năng phát video
const YouTubePlayer = ({ videoId }) => {
  // State quản lý trạng thái đang phát video
  const [isPlaying, setIsPlaying] = useState(false);
  // State quản lý trạng thái đang tải video
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý để trích xuất ID video từ nhiều định dạng URL YouTube khác nhau
  const getVideoId = (idOrUrl) => {
    if (idOrUrl.includes("youtube.com") || idOrUrl.includes("youtu.be")) {
      if (idOrUrl.includes("youtube.com/embed/")) {
        return idOrUrl.split("/embed/")[1].split("?")[0];
      } else if (idOrUrl.includes("youtube.com/watch")) {
        const url = new URL(idOrUrl);
        return url.searchParams.get("v");
      } else if (idOrUrl.includes("youtu.be")) {
        return idOrUrl.split("youtu.be/")[1].split("?")[0];
      }
    }
    return idOrUrl;
  };

  // Lấy ID thực tế của video từ prop videoId
  const actualVideoId = getVideoId(videoId);
  // Tạo URL hình thumbnail chất lượng cao cho video
  const thumbnailUrl = `https://img.youtube.com/vi/${actualVideoId}/hqdefault.jpg`;

  // Hàm xử lý khi người dùng nhấn vào nút phát
  const handlePlay = () => {
    setIsLoading(true); // Bắt đầu trạng thái loading
    setIsPlaying(true); // Chuyển sang trạng thái đang phát
  };

  // Hàm xử lý khi WebView đã tải xong
  const onLoadEnd = () => {
    setIsLoading(false); // Kết thúc trạng thái loading
  };

  // Định nghĩa nội dung HTML để nhúng player YouTube sử dụng YouTube IFrame API
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { padding: 0; margin: 0; box-sizing: border-box; overflow: hidden; }
          html, body { width: 100%; height: 100%; background-color: #000; }
          .container { width: 100%; height: 100%; position: relative; }
          iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <div class="container" id="container">
          <div id="player"></div>
        </div>
        <script>
          // Tải YouTube IFrame Player API không đồng bộ
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
              width: '100%',
              height: '100%',
              videoId: '${actualVideoId}',
              playerVars: {
                'autoplay': 1, // Tự động phát
                'playsinline': 1, // Phát trong dòng (không toàn màn hình) trên iOS
                'controls': 1, // Hiển thị các nút điều khiển
                'rel': 0, // Không hiện video liên quan
                'showinfo': 0, // Không hiện thông tin video
                'modestbranding': 1, // Giảm thương hiệu YouTube
                'iv_load_policy': 3 // Không hiện chú thích
              },
              events: {
                'onReady': onPlayerReady, // Sự kiện khi player sẵn sàng
                'onStateChange': onPlayerStateChange // Sự kiện khi trạng thái player thay đổi
              }
            });
          }

          function onPlayerReady(event) {
            event.target.playVideo(); // Tự động phát video khi player sẵn sàng
            window.ReactNativeWebView.postMessage('loaded'); // Gửi thông báo đã tải xong
          }

          function onPlayerStateChange(event) {
            if (event.data == YT.PlayerState.PLAYING) {
              window.ReactNativeWebView.postMessage('playing'); // Gửi thông báo video đang phát
            }
          }

          // Buộc sử dụng hardware acceleration
          function forceHardwareAcceleration() {
            const style = document.createElement('style');
            document.head.appendChild(style);
          }
          
          forceHardwareAcceleration();
        </script>
      </body>
    </html>
  `;

  return (
    // Container chính của component
    <View style={styles.container}>
      {!isPlaying ? (
        // Hiển thị thumbnail và nút phát khi chưa phát video
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={handlePlay}
        >
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.playButtonContainer}>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        // Hiển thị WebView để phát video khi người dùng đã nhấn phát
        <View style={styles.webviewContainer}>
          {isLoading && (
            // Hiển thị indicator loading khi đang tải video
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <WebView
            style={styles.webview}
            source={{ html: htmlContent }} // Sử dụng HTML content đã định nghĩa
            originWhitelist={["*"]} // Cho phép tất cả các nguồn
            allowsFullscreenVideo={true} // Cho phép xem video toàn màn hình
            allowsInlineMediaPlayback={true} // Cho phép phát video trong dòng
            mediaPlaybackRequiresUserAction={false} // Không yêu cầu tương tác người dùng để phát media
            javaScriptEnabled={true} // Bật JavaScript
            domStorageEnabled={true} // Bật DOM storage
            startInLoadingState={true} // Bắt đầu ở trạng thái loading
            onLoad={onLoadEnd} // Xử lý sự kiện khi tải xong
            onLoadEnd={onLoadEnd} // Xử lý sự kiện khi kết thúc tải
            onMessage={(event) => {
              // Xử lý tin nhắn từ WebView JavaScript
              const message = event.nativeEvent.data;
              if (message === "loaded" || message === "playing") {
                setIsLoading(false); // Kết thúc trạng thái loading
              }
            }}
            // Sử dụng WebKit renderer trên iOS
            useWebKit={true}
            renderLoading={() => (
              // Component hiển thị khi WebView đang tải
              <ActivityIndicator color="#fff" size="large" />
            )}
            androidHardwareAccelerationDisabled={false} // Bật tăng tốc phần cứng trên Android
            androidLayerType="hardware" // Sử dụng hardware layer trên Android
          />
        </View>
      )}
    </View>
  );
};

// Định nghĩa các style sử dụng trong component
const styles = StyleSheet.create({
  container: {
    width: "100%", // Chiều rộng 100%
    aspectRatio: 16 / 9, // Tỷ lệ khung hình 16:9 như video YouTube
    backgroundColor: "#000", // Nền đen
    overflow: "hidden", // Ẩn nội dung vượt ra ngoài container
    borderRadius: 8, // Bo góc 8 đơn vị
  },
  thumbnailContainer: {
    width: "100%", // Chiều rộng 100%
    height: "100%", // Chiều cao 100%
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
  },
  thumbnail: {
    width: "100%", // Chiều rộng 100%
    height: "100%", // Chiều cao 100%
    position: "absolute", // Vị trí tuyệt đối
  },
  playButtonContainer: {
    position: "absolute", // Vị trí tuyệt đối
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Lớp phủ mờ màu đen
    width: "100%", // Chiều rộng 100%
    height: "100%", // Chiều cao 100%
  },
  playButton: {
    width: 70, // Chiều rộng 70 đơn vị
    height: 70, // Chiều cao 70 đơn vị
    borderRadius: 35, // Bo tròn (một nửa chiều rộng)
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Nền đen mờ
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
  },
  playButtonText: {
    color: "#fff", // Màu chữ trắng
    fontSize: 30, // Cỡ chữ 30
    marginLeft: 5, // Lề trái 5 đơn vị để căn chỉnh biểu tượng phát
  },
  webviewContainer: {
    width: "100%", // Chiều rộng 100%
    height: "100%", // Chiều cao 100%
  },
  webview: {
    flex: 1, // Mở rộng chiếm hết không gian có thể
    backgroundColor: "#000", // Nền đen
  },
  loadingContainer: {
    position: "absolute", // Vị trí tuyệt đối
    top: 0, // Căn trên cùng
    left: 0, // Căn trái
    right: 0, // Căn phải
    bottom: 0, // Căn dưới cùng
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
    backgroundColor: "#000", // Nền đen
    zIndex: 10, // Đặt lớp hiển thị cao hơn các phần tử khác
  },
});

// Xuất component để có thể import trong các file khác
export default YouTubePlayer;