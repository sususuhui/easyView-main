import React, { useEffect } from 'react';
import { KeepAlive } from 'umi';

interface IframeAppProps {
  src: string;
}

function IframeApp({ src }: IframeAppProps) {
  const ref = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log(location.pathname);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      width="100%"
      height="100%"
      frameBorder={0}
      name={location.pathname}
    />
  );
}

export default (): React.ReactNode => {
  const src = `http://localhost:7104?id=${location.pathname}`;
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
