import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, Environment, GoogleMapsAnimation, ILatLng } from '@ionic-native/google-maps';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute } from '@angular/router';
import { MeetingService } from 'src/app/services/meeting.service';

declare var google;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  @ViewChild("map") mapElement: any;

  meeting: IMeeting;

  private colorMarker: string = "#0d476b";

  private loading: any;
  private map: GoogleMap;
  private googleMapsDirections = new google.maps.DirectionsService();
  private origin: Marker;
  private destination: Marker;
  private travelMode: string = "DRIVING";

  constructor(
    private nav: NavController,
    private loadingController: LoadingController,
    private platform: Platform,
    private statusBar: StatusBar,
    private meetingService: MeetingService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.statusBar.overlaysWebView(true);
    this.loadDataFromMeeting();
    this.loadMap();
  }

  ionViewDidLeave(){
    this.statusBar.styleDefault();
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString('#d3d6e7');
  }

  ngAfterViewInit() {
    this.mapElement = this.mapElement.nativeElement;

    this.mapElement.style.width = `${this.platform.width()}px`;
    this.mapElement.style.height = `${this.platform.height() - 200}px`;
  }

  async back(){
    await this.nav.back();
  }

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.meetingService.getById(id).snapshotChanges().subscribe(async response => {

        const data: any = response.payload.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.payload.id;

      });

    } catch(error) {
      console.error(error);
    } 
  }

  async loadMap() {

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    // This code is necessary for browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCQW7UBbaXZdVAmA0RizRc3XqST8hpUrvQ',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCQW7UBbaXZdVAmA0RizRc3XqST8hpUrvQ'
    });

    let mapOptions: GoogleMapOptions = {
      controls: {
        zoom: false
      }
    };

    this.map = GoogleMaps.create(this.mapElement, mapOptions);

    try{
      await this.map.one(GoogleMapsEvent.MAP_READY);

      this.origin = this.map.addMarkerSync({
        title: "Teste",
        icon: this.colorMarker,
        animation: GoogleMapsAnimation.BOUNCE,
        position: {
          lat: -23.4630129,
          lng: -46.5326677,
        }
      });

      this.destination = this.map.addMarkerSync({
        title: this.meeting.location.address,
        icon: this.colorMarker,
        animation: GoogleMapsAnimation.BOUNCE,
        position: {
          lat: this.meeting.location.latitude,
          lng: this.meeting.location.longitude,
        }
      });

      await this.calcRoute();
      
    } catch(error) {
      console.log(error);
    } finally {
      this.loading.dismiss();
    }
  }

  async calcRoute() {
    const points = new Array<ILatLng>();

    await this.googleMapsDirections.route({
      origin: this.origin.getPosition(),
      destination: this.destination.getPosition(),
      travelMode: this.travelMode
    }, async response => {
      
      response.routes[0].overview_path.forEach(path => {
        points.push({
          lat: path.lat(),
          lng: path.lng()
        });
      });

      await this.map.addPolyline({
        points: points,
        color: this.colorMarker,
        width: 3
      });

      this.map.moveCamera({
        target: points
      });
    });
  }
}
