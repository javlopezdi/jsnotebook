import { useState, useEffect, useRef } from 'react';
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const App = () => {
  useEffect(() => {
    startService();
  }, []);

  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState('');
  // const [code, setCode] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };

  const handleClick = async () => {
    if (!ref.current) return;

    // Reset the iframe content
    iframe.current.srcdoc = html;

    // Bundle and transpile code in the input
    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
  };

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
              eval(event.data)
            } catch(e) {
              document.querySelector('#root').innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + e + '</div>'
              console.error(e)
            }
          }, false) 
        </script>
      </body>
    </html>
  `;

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={handleClick}>Submit</button>
      </div>
      <iframe
        ref={iframe}
        title="code executed"
        sandbox="allow-scripts"
        srcDoc={html}
      />
    </div>
  );
};

export default App;
