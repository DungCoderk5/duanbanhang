import Link from "next/link";
export default function Banner(){
    return (
        <section className="awe-section-2">
    <div className="section section-banner">
      <div className="container1">
        <div className="rows">
          <div className="col-md-6 col-sm-6 col-xs-12 hidden-xs">
            <div className="box mg_mb mg_l_mb">
              <a href="#" title="dualeo-food">
                <img className="lazyload loaded"
                  src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/banner_box_1.jpg?1676001091788" alt="alt"
                  data-ll-status="loaded"/>

              </a>
            </div>
          </div>
          <div className="col-md-6 col-sm-6 col-xs-12">
            <div className="rows">
              <div className="col-md-6 col-xs-6">
                <div className="box margin-bottom-15">
                  <a href="#" title="dualeo-food">
                    <img className="lazyload loaded"
                      src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/banner_box_2.jpg?1676001091788"
                      alt="alt" data-ll-status="loaded"/>
                  </a>
                </div>
              </div>
              <div className="col-md-6 col-xs-6">
                <div className="box margin-bottom-15">
                  <a href="#" title="dualeo-food">
                    <img className="lazyload loaded"
                      src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/banner_box_3.jpg?1676001091788"
                      alt="alt" data-ll-status="loaded"/>
                  </a>
                </div>
              </div>
            </div>
            <div className="box padding-top-15">
              <a href="#" title="dualeo-food">
                <img className="lazyload loaded"
                  src="//bizweb.dktcdn.net/100/310/257/themes/801944/assets/banner_box_4.jpg?1676001091788" alt="alt"
                  data-ll-status="loaded"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
    );
}