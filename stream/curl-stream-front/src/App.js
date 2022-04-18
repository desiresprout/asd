import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Player, Video } from '@vime/react';

function App() {
  const [moiveSrc, setMovieSrc] = useState(null);
  useEffect(() => {
    axios
      .get('http://localhost:5000', {
        responseType: 'blob',
      })
      .then((res) => {
        console.log('res', res);
        const blobUrl = URL.createObjectURL(res.data);
        console.log('blobUrl', blobUrl);
        setMovieSrc(blobUrl);
      });
  }, []);

  return (
    <div className="App">
      {/* <img src={'localhost:5000'} className="App-logo" alt="logo" /> */}
      <video
        // src={'http://localhost:5000'}
        src={moiveSrc}
        type="video/mp4"
        autoPlay
        muted
        controls
        className="App-logo"
      >
        <source src={moiveSrc} />
      </video>

      <Player>
        <Video>
          <source data-src={moiveSrc} type="video/mp4" />
        </Video>
      </Player>
      {/* <video type="video/mp4" controls autoPlay muted className="App-logo">
        <source
          src={'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        />
      </video> */}
    </div>
  );
}

export default App;
