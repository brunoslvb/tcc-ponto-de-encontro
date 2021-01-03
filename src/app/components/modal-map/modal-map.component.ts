import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController, Platform } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/meeting';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, CameraPosition, MarkerOptions, Marker, Environment } from '@ionic-native/google-maps';

@Component({
  selector: 'app-modal-map',
  templateUrl: './modal-map.component.html',
  styleUrls: ['./modal-map.component.scss'],
})
export class ModalMapComponent implements OnInit {

  @ViewChild('map') mapElement: any; 

  @Input() name: string;

  private loading: any;
  private map: GoogleMap;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private platform: Platform
  ) { }

  ngOnInit() {

    this.mapElement.style.width = `${this.platform.width}px`;
    this.mapElement.style.height = `${this.platform.height}px`;

    this.loadMap();
  }

  async closeModalMap(){
    await this.modalController.dismiss();
  }

  async loadMap() {

    this.loading = await this.loadingController.create({ message: "Aguarde..." });
    await this.loading.present();

    // This code is necessary for browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCQW7UBbaXZdVAmA0RizRc3XqST8hpUrvQ',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCQW7UBbaXZdVAmA0RizRc3XqST8hpUrvQ'
    });

    // let mapOptions: GoogleMapOptions = {
    //   camera: {
    //      target: {
    //        lat: 43.0741904,
    //        lng: -89.3809802
    //      },
    //      zoom: 18,
    //      tilt: 30
    //    }
    // };

    this.map = GoogleMaps.create(this.mapElement);

    // let marker: Marker = this.map.addMarkerSync({
    //   title: 'Ionic',
    //   icon: 'blue',
    //   animation: 'DROP',
    //   position: {
    //     lat: 43.0741904,
    //     lng: -89.3809802
    //   }
    // });
    // marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
    //   alert('clicked');
    // });
  }

}
