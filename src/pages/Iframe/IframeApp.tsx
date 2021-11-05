import React, { useEffect } from 'react';
import { KeepAlive } from 'umi';

interface IframeAppProps {
  src: string;
}

function IframeApp({ src }: IframeAppProps) {
  const ref = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('====');
  }, []);

  return <iframe ref={ref} src={src} width="100%" height="100%" frameBorder={0} />;
}

export default (): React.ReactNode => {
  const tagList = localStorage.getItem('tagList')
    ? JSON.parse(localStorage.getItem('tagList') as string)
    : [];
  const current = tagList.filter((item: { path: string }) => item.path === location.pathname);
  const flag = current && current.length > 0 ? false : true;
  const prodUrl = `https://easyview.deepfos.com/documents/myHtml/index.html?current=${flag}&id=${location.pathname}`;
  const devUrl = `http://localhost:7104?current=${flag}&id=${location.pathname}`;
  const { NODE_ENV } = process.env;
  const src = NODE_ENV === 'development' ? devUrl : prodUrl;
  return (
    <KeepAlive
      id={location.pathname + location.search}
      name={location.pathname + location.search}
      key={location.pathname + location.search}
      saveScrollPosition="screen"
    >
      <IframeApp src={src} />
    </KeepAlive>
  );
};
