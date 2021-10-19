import { MicroApp } from 'umi';
import tagUtil from '@/utils/tags';
import React, { useEffect } from 'react';
import { Provider, KeepAlive } from 'react-keep-alive';

const {
  method: { dealTags },
} = tagUtil;

function HtmlMicro() {
  useEffect(() => {}, []);
  return <MicroApp name={location.pathname.split('/')[1]} dealTags={dealTags} autoSetLoading />;
}

export default (): React.ReactNode => {
  return (
    // <KeepAlive
    //   id={location.pathname + location.search}
    //   name={location.pathname + location.search}
    //   saveScrollPosition="screen"
    // >
    //   <HtmlMicro />
    // </KeepAlive>
    <Provider>
      <KeepAlive
        key={location.pathname + location.search}
        name={location.pathname + location.search}
      >
        <HtmlMicro />
      </KeepAlive>
    </Provider>
  );
};
