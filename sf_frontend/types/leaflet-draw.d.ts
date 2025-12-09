import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }

  namespace Draw {
    namespace Event {
      const CREATED: string;
      const DELETED: string;
    }
  }
}
