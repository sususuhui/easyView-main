import React, { useEffect, useState } from 'react';

function IframeApp() {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [id, setId] = useState(location.pathname);
  const prodUrl = `https://easyview.deepfos.com/documents/myHtml/index.html?id=${location.pathname}`;
  const devUrl = `http://localhost:7104?id=${location.pathname}`;
  const { NODE_ENV } = process.env;
  const [src, setSrc] = useState(NODE_ENV === 'development' ? devUrl : prodUrl);

  useEffect(() => {
    setId(location.pathname);
    const newProdUrl = `https://easyview.deepfos.com/documents/myHtml/index.html?id=${location.pathname}`;
    const newDevUrl = `http://localhost:7104?id=${location.pathname}`;
    const nodeEnv = process.env.NODE_ENV;
    setSrc(nodeEnv === 'development' ? newDevUrl : newProdUrl);
  }, []);

  return <iframe id={id} src={src} ref={ref} width="100%" height="100%" frameBorder={0} />;
}

export default (): React.ReactNode => {
  return <IframeApp />;
};
