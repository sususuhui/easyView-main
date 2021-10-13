declare namespace API {
  type AppItem = {
    type?: string;
    key?: string;
    id?: string | number;
    name?: string;
    desc?: string;
    app?: string | number | null;
    ud1?: string;
  };
  type ContentItem = {
    exp?: any;
    id?: string;
    content?: any;
  };
}
