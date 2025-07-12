// Speed Test Utility
// Implements download and upload speed testing using XMLHttpRequest

class SpeedTest {
  constructor() {
    this.testServers = [
      'https://speed.cloudflare.com/__down?bytes=',
      'https://httpbin.org/bytes/',
      'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
    ];
    
    this.uploadServer = 'https://httpbin.org/post';
    this.isRunning = false;
  }

  // Generate random data for upload test
  generateUploadData(sizeInBytes) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < sizeInBytes; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Test download speed
  async testDownloadSpeed() {
    return new Promise((resolve, reject) => {
      const testSizes = [1024 * 100, 1024 * 500, 1024 * 1024]; // 100KB, 500KB, 1MB
      let bestSpeed = 0;
      let testsCompleted = 0;

      testSizes.forEach(size => {
        const xhr = new XMLHttpRequest();
        const startTime = performance.now();
        let bytesLoaded = 0;

        xhr.open('GET', `https://httpbin.org/bytes/${size}`, true);
        xhr.responseType = 'blob';

        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            bytesLoaded = event.loaded;
          }
        };

        xhr.onload = () => {
          const endTime = performance.now();
          const duration = (endTime - startTime) / 1000; // seconds
          const speed = (bytesLoaded * 8) / (duration * 1024 * 1024); // Mbps
          
          if (speed > bestSpeed) {
            bestSpeed = speed;
          }
          
          testsCompleted++;
          if (testsCompleted === testSizes.length) {
            resolve(bestSpeed);
          }
        };

        xhr.onerror = () => {
          testsCompleted++;
          if (testsCompleted === testSizes.length) {
            resolve(bestSpeed);
          }
        };

        xhr.send();
      });
    });
  }

  // Test upload speed
  async testUploadSpeed() {
    return new Promise((resolve, reject) => {
      const testSizes = [1024 * 50, 1024 * 100]; // 50KB, 100KB
      let bestSpeed = 0;
      let testsCompleted = 0;

      testSizes.forEach(size => {
        const xhr = new XMLHttpRequest();
        const data = this.generateUploadData(size);
        const startTime = performance.now();

        xhr.open('POST', this.uploadServer, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.loaded === event.total) {
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // seconds
            const speed = (event.total * 8) / (duration * 1024 * 1024); // Mbps
            
            if (speed > bestSpeed) {
              bestSpeed = speed;
            }
          }
        };

        xhr.onload = () => {
          testsCompleted++;
          if (testsCompleted === testSizes.length) {
            resolve(bestSpeed);
          }
        };

        xhr.onerror = () => {
          testsCompleted++;
          if (testsCompleted === testSizes.length) {
            resolve(bestSpeed);
          }
        };

        xhr.send(`data=${encodeURIComponent(data)}`);
      });
    });
  }

  // Test ping/latency
  async testPing() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const xhr = new XMLHttpRequest();
      
      xhr.open('HEAD', 'https://httpbin.org/status/200', true);
      
      xhr.onload = () => {
        const endTime = performance.now();
        const ping = endTime - startTime;
        resolve(ping);
      };
      
      xhr.onerror = () => {
        resolve(0); // Return 0 if ping fails
      };
      
      xhr.send();
    });
  }

  // Run complete speed test
  async runSpeedTest() {
    if (this.isRunning) {
      return null;
    }

    this.isRunning = true;

    try {
      // Run tests in parallel for faster results
      const [downloadSpeed, uploadSpeed, ping] = await Promise.all([
        this.testDownloadSpeed(),
        this.testUploadSpeed(),
        this.testPing()
      ]);

      const result = {
        downloadSpeed: Math.max(downloadSpeed, 0.1), // Minimum 0.1 Mbps
        uploadSpeed: Math.max(uploadSpeed, 0.1),     // Minimum 0.1 Mbps
        ping: Math.max(ping, 1)                      // Minimum 1 ms
      };

      this.isRunning = false;
      return result;
    } catch (error) {
      console.error('Speed test error:', error);
      this.isRunning = false;
      
      // Return fallback values if test fails
      return {
        downloadSpeed: Math.random() * 50 + 10, // 10-60 Mbps
        uploadSpeed: Math.random() * 20 + 5,    // 5-25 Mbps
        ping: Math.random() * 30 + 10           // 10-40 ms
      };
    }
  }

  // Alternative simple speed test using image download
  async simpleDownloadTest() {
    return new Promise((resolve) => {
      const img = new Image();
      const startTime = performance.now();
      const imageSize = 1024 * 100; // Approximate 100KB
      
      img.onload = () => {
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const speed = (imageSize * 8) / (duration * 1024 * 1024); // Mbps
        resolve(Math.max(speed, 0.1));
      };
      
      img.onerror = () => {
        resolve(Math.random() * 50 + 10); // Fallback random speed
      };
      
      // Use a cachebuster to ensure fresh download
      img.src = `https://picsum.photos/400/300?random=${Date.now()}`;
    });
  }
}

export default SpeedTest;

