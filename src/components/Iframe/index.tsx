import React from 'react';

interface IframeAppProps {
  src: string;
}

export default function Index({ src }: IframeAppProps) {
  const ref = React.useRef<HTMLIFrameElement>(null);

  return <iframe ref={ref} src={src} width="100%" height="100%" frameBorder={0} name={src} />;
}
