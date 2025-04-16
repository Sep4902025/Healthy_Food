import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";

const YouTubePlayer = ({ videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
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

  const actualVideoId = getVideoId(videoId);
  const thumbnailUrl = `https://img.youtube.com/vi/${actualVideoId}/hqdefault.jpg`;

  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

 
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
          // Load the YouTube IFrame Player API code asynchronously
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
                'autoplay': 1,
                'playsinline': 1,
                'controls': 1,
                'rel': 0,
                'showinfo': 0,
                'modestbranding': 1,
                'iv_load_policy': 3
              },
              events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
              }
            });
          }

          function onPlayerReady(event) {
            event.target.playVideo();
            window.ReactNativeWebView.postMessage('loaded');
          }

          function onPlayerStateChange(event) {
            if (event.data == YT.PlayerState.PLAYING) {
              window.ReactNativeWebView.postMessage('playing');
            }
          }

          // Force hardware acceleration
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
    <View style={styles.container}>
      {!isPlaying ? (
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
        <View style={styles.webviewContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <WebView
            style={styles.webview}
            source={{ html: htmlContent }}
            originWhitelist={["*"]}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onLoad={onLoadEnd}
            onLoadEnd={onLoadEnd}
            onMessage={(event) => {
              const message = event.nativeEvent.data;
              if (message === "loaded" || message === "playing") {
                setIsLoading(false);
              }
            }}
            
            useWebKit={true}
            renderLoading={() => (
              <ActivityIndicator color="#fff" size="large" />
            )}
            androidHardwareAccelerationDisabled={false}
            androidLayerType="hardware"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    overflow: "hidden",
    borderRadius: 8,
  },
  thumbnailContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  playButtonContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: "100%",
    height: "100%",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 30,
    marginLeft: 5,
  },
  webviewContainer: {
    width: "100%",
    height: "100%",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 10,
  },
});

export default YouTubePlayer;
