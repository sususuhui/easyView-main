declare namespace API {
  type AppItem = {
    type?: string;
    id?: string | number;
    name?: string;
    desc?: string;
  };
  type ContentItem = {
    exp?: any;
    id?: string;
    content?: any;
  };
}
