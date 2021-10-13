import { KeepAlive, MicroAppWithMemoHistory, useAliveController } from 'umi';
import tagUtil from '@/utils/tags';
import React, { useEffect } from 'react';

const {
  method: { dealTags },
} = tagUtil;

function HtmlMicro() {
  const { getCachingNodes } = useAliveController();
  const cachingNodes = getCachingNodes();
  useEffect(() => {
    console.log(cachingNodes);
  }, []);

  return <MicroAppWithMemoHistory name="myHtml" dealTags={dealTags} autoSetLoading />;
}

export default (): React.ReactNode => {
  return (
    <KeepAlive
      id={location.pathname + location.search}
      name={location.pathname + location.search}
      saveScrollPosition="screen"
    >
      <HtmlMicro />
    </KeepAlive>
  );
};
