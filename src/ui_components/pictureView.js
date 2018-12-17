'use strict';

const React = require('react');
const Ons = require('react-onsenui');

//custom imports
const map = require('./map.js');
const config = require('../data_components/config.json');

/**
 * Component for displaying the picture view. On top a picture is displayed and below a map.
 * The map is generated in the same way, it is defined in the config file.
 */
class PictureView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentImage: 0,
            images: config.app.numberOfImages,
        }
        this.handlePictureChange = this.handlePictureChange.bind(this);
    }

    //handle a change in the carousel
    handlePictureChange(e) {
        console.log(this.state.currentImage);
        console.log(e.activeIndex);
        this.setState({currentImage: e.activeIndex});
    }

    render() {
        const filepath = 'img/';
        var images = [];
        for(var i = 0; i < this.state.images; i++) {
            var path = filepath + i + '.jpg';
            images.push(path);
        }
        return (
            <div className="center" style={{height: '100%'}}>
                <Ons.Carousel onPostChange={this.handlePictureChange} index={this.state.currentImage} style={{width: '100%', height: '50%'}} swipeable autoScroll>
                    {
                        images.map( (image, index) => (
                            <Ons.CarouselItem key={index}>
                                <img style={{display: 'block', width: '100%'}} src={image}/>
                            </Ons.CarouselItem>
                        ))
                    }
                </Ons.Carousel>
                <Ons.Row style={{width: '100%', height: '50%'}}>
                    <map.Map picture={true} logging={this.props.logging} externalData={this.props.externalData} useLocation={this.props.useLocation} layerControl={this.props.layerControl}
                            draggable={this.props.draggable}  zoomable={this.props.zoomable}/>
                </Ons.Row>
            </div>
        )
    }
}

module.exports = {
    PictureView: PictureView
}
