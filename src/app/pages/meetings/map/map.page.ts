import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController, NavController, NavParams, Platform, ToastController } from '@ionic/angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, Environment, GoogleMapsAnimation, ILatLng, Polygon, Poly } from '@ionic-native/google-maps';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute } from '@angular/router';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import { IUser } from 'src/app/interfaces/User';
import { Subscription } from 'rxjs';
import loadsh from 'lodash';
import watchers from 'src/environments/globals';
import { MapService } from 'src/app/services/map.service';

declare var google;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  @ViewChild("map") mapElement: any;

  meeting: IMeeting;
  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));

  private colorMarker: string = "#0d476b";

  private loading: any;
  private map: any;
  private googleMapsDirections = new google.maps.DirectionsService();
  private googleMapsDisplay = new google.maps.DirectionsRenderer();
  private origins: Marker[];
  private myOrigin: any;
  private destination: any;
  travelMode: string = null;
  travelModeAux: string = null;

  private listener: Subscription;
  refreshFlag: boolean = false;

  private watchPosition: any = null;

  private subpointGroup: any;

  users = [];

  myLocationFlag: boolean = false;

  private groupedUsers = [];

  private markers: any[] = [];

  private group1Vertices = null;
  private group2Vertices = null;
  private group3Vertices = null;
  private group4Vertices = null;

  private group1Polygon = null;
  private group2Polygon = null;
  private group3Polygon = null;
  private group4Polygon = null;

  private subpointRadius: any = null;

  constructor(
    private nav: NavController,
    private loadingController: LoadingController,
    private platform: Platform,
    private statusBar: StatusBar,
    private meetingService: MeetingService,
    private userService: UserService,
    private route: ActivatedRoute,
    private mapService: MapService,
    private toastController: ToastController
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.statusBar.backgroundColorByHexString('#F8F8F8');
    this.statusBar.styleDefault();
    this.load();
  }

  ionViewDidLeave() {
    // this.statusBar.styleDefault();
    this.statusBar.backgroundColorByHexString('#4ECDC4');
    // this.listener.unsubscribe();
  }

  ngAfterViewInit() {
    this.mapElement = this.mapElement.nativeElement;

    this.mapElement.style.width = `${this.platform.width()}px`;
    this.mapElement.style.height = `${this.platform.height() - 200}px`;
  }

  async back() {
    await this.nav.back();
  }

  async load() {

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    try {
      await this.loadMap();
      await this.loadUser();
      await this.loadMeeting();
      await this.loadMapObjects();
      // await this.loadMeetingListener();

    } catch (error) {
      console.error(error);

    }

    await this.loading.dismiss();

  }

  async loadMapObjects() {
    await this.loadUsers();
    await this.loadDestination();
    await this.joinUsersInSameArea();
    await this.loadMyOrigin();
    await this.loadOrigins();
    await this.loadSubpoint();
    await this.getRoutes();
    this.getMarkers();
  }

  async getCurrentLocation() {

    const flag = !this.user.groups[this.meeting.id].myLocation;

    this.user.groups[this.meeting.id].myLocation = flag;

    await this.userService.update(this.user);

    this.refresh();

  }

  async loadMeeting() {
    const id = this.route.snapshot.paramMap.get("id");

    await this.meetingService.getById(id).get().toPromise().then(async response => {

      const data: any = response.data();

      this.meeting = data;

      this.meeting.id = response.id;

      this.myLocationFlag = this.user.groups[this.meeting.id].myLocation;

      this.travelMode = this.meeting.members[this.user.phone].travelMode ? this.meeting.members[this.user.phone].travelMode : 'DRIVING';

      this.mapService.checkActiveLocations(this.user);

    });
  }

  async loadUser() {

    try {

      await this.userService.getById(this.user.phone).get().toPromise().then(async response => {

        const data: any = response.data();

        this.user = data;

      });

    } catch (error) {
      console.error(error);
    }
  }

  async loadUsers() {

    const promises = Object.keys(this.meeting.members).map(member => this.userService.getById(member).get().toPromise().then(response => response.data()));

    await Promise.all(promises).then(async (response) => {

      this.users = response.map((user: any) => {

        if (Object.keys(this.meeting.members[user.phone]).length !== 0) {
          user.temp = this.meeting.members[user.phone];
        } else {
          user.temp = {};
        }

        return user;

      });

    });

  }

  async getSubpointGroup() {
    this.subpointGroup = await this.meetingService.getSubpointGroup(this.meeting.id);
    // this.subpointGroup = "group1";
    console.log(this.subpointGroup);

  }

  async loadDestination() {

    this.destination = new google.maps.Marker({
      title: this.meeting.location.address,
      position: {
        lat: this.meeting.location.latitude,
        lng: this.meeting.location.longitude,
      },
      icon: '../../../../assets/flag.png',
      map: this.map
    });

    this.markers.push(this.destination);

    // const { lat, lng } = this.destination.getPosition();

    const lat = this.meeting.location.latitude;
    const lng = this.meeting.location.longitude;

    const yOffset = -23.2;
    const xOffset = 0.4;

    const fillColor = "transparent";
    const strokeColor = "transparent";

    this.group1Vertices = [
      { lat: lat, lng },
      { lat: lat + (yOffset - lat), lng },
      { lat: lat + (yOffset - lat), lng: lng + xOffset },
      { lat, lng: lng + xOffset }
    ];

    //group1 lat > t.lat ; lng > t.lng
    this.group1Polygon = new google.maps.Polygon({
      paths: this.group1Vertices,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor,
      fillOpacity: 0.35,
      clickable: true
    });
    //group2 lat > t.lat; lng < t.lng
    this.group2Vertices = [
      { lat, lng },
      { lat: lat + (yOffset - lat), lng },
      { lat: lat + (yOffset - lat), lng: lng - xOffset },
      { lat, lng: lng - xOffset }
    ];

    this.group2Polygon = new google.maps.Polygon({
      paths: this.group2Vertices,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor,
      fillOpacity: 0.35,
      clickable: true
    });

    //group3 lat < t.lat; lng < t.lng

    this.group3Vertices = [
      { lat, lng },
      { lat: lat - (yOffset - lat), lng },
      { lat: lat - (yOffset - lat), lng: lng - xOffset },
      { lat: lat, lng: lng - xOffset }
    ];

    this.group3Polygon = new google.maps.Polygon({
      paths: this.group3Vertices,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor,
      fillOpacity: 0.35,
      clickable: true,
    });

    //group4 lat < t.lat; lng > t.lng

    this.group4Vertices = [
      { lat, lng },
      { lat: lat - (yOffset - lat), lng },
      { lat: lat - (yOffset - lat), lng: lng + xOffset },
      { lat, lng: lng + xOffset }
    ];

    this.group4Polygon = new google.maps.Polygon({
      paths: this.group4Vertices,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor,
      fillOpacity: 0.35,
      clickable: true
    });

    this.group1Polygon.setMap(this.map);
    this.group2Polygon.setMap(this.map);
    this.group3Polygon.setMap(this.map);
    this.group4Polygon.setMap(this.map);

  }

  async joinUsersInSameArea() {

    console.log("Join users ...");

    let members = this.users;

    const group1 = {
      id: 'group1',
      location: this.meeting.subpoints.group1.location ? this.meeting.subpoints.group1.location : { members: [] },
      suggestion: this.meeting.subpoints.group1.suggestion ? this.meeting.subpoints.group1.suggestion : { pending: false, votes: {} },
      members: []
    }

    const group2 = {
      id: 'group2',
      location: this.meeting.subpoints.group2.location ? this.meeting.subpoints.group2.location : { members: [] },
      suggestion: this.meeting.subpoints.group2.suggestion ? this.meeting.subpoints.group2.suggestion : { pending: false, votes: {} },
      members: []
    }

    const group3 = {
      id: 'group3',
      location: this.meeting.subpoints.group3.location ? this.meeting.subpoints.group3.location : { members: [] },
      suggestion: this.meeting.subpoints.group3.suggestion ? this.meeting.subpoints.group3.suggestion : { pending: false, votes: {} },
      members: []
    }

    const group4 = {
      id: 'group4',
      location: this.meeting.subpoints.group4.location ? this.meeting.subpoints.group4.location : { members: [] },
      suggestion: this.meeting.subpoints.group4.suggestion ? this.meeting.subpoints.group4.suggestion : { pending: false, votes: {} },
      members: []
    }

    for (let i = 0; i < members.length; i++) {

      const data = {
        phone: members[i].phone,
      }

      const { latitude, longitude } = this.getLatLng(members[i], this.meeting);

      if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(latitude, longitude), this.group1Polygon)) {
        group1.members.push(data);
        continue;
      }

      if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(latitude, longitude), this.group2Polygon)) {
        group2.members.push(data);
        continue;
      }

      if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(latitude, longitude), this.group3Polygon)) {
        group3.members.push(data);
        continue;
      }

      if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(latitude, longitude), this.group4Polygon)) {
        group4.members.push(data);
        continue;
      }

    }

    const data = {
      subpoints: {
        group1,
        group2,
        group3,
        group4
      }
    }

    // console.log(this.meeting);
    // console.log({...this.meeting, ...data});

    console.log(loadsh.isEqual(this.meeting, { ...this.meeting, ...data }));

    if (!loadsh.isEqual(this.meeting, { ...this.meeting, ...data })) {
      await this.meetingService.update(this.meeting.id, { ...this.meeting, ...data });
    }

    await this.getSubpointGroup();
    await this.loadMeeting();

  }

  async getBiggerDistance() {

    const distances = [];

    for (const item of this.groupedUsers) {
      await this.googleMapsDirections.route({
        origin: {
          lat: item.location.latitude,
          lng: item.location.longitude,
        },
        destination: this.destination.getPosition(),
        travelMode: this.travelMode
      }, async (response: any) => {
        item.location.distance = response.routes[0].legs[0].distance.value;
        distances.push(item);
      });
    }

    let response = null;

    if (distances.length > 1) {
      response = distances.sort((a, b) => a.location.distance - b.location.distance)[distances.length - 1];
    } else {
      response = distances[0];
    }

    console.log(response);

    return response;

  }

  async loadMyOrigin() {

    const { latitude, longitude } = this.getLatLng(this.user, this.meeting);

    this.myOrigin = new google.maps.Marker({
      title: this.user.name,
      position: new google.maps.LatLng(latitude, longitude),
      icon: '../../../../assets/person.png',
      map: this.map
    });

    this.setInfoWindow(this.myOrigin);

  }

  async loadOrigins() {

    this.users.forEach((user: any) => {

      if (user.phone !== this.user.phone) {

        const { latitude, longitude } = this.getLatLng(user, this.meeting);

        this.markers.push(new google.maps.Marker({
          title: user.name,
          position: new google.maps.LatLng(latitude, longitude),
          map: this.map,
          icon: '../../../../assets/person.png'
        }));
      }
    });

  }

  getLatLng(user, meeting) {
    let latitude = null;
    let longitude = null;

    if (meeting.members[user.phone].latitude) {
      latitude = meeting.members[user.phone].latitude;
      longitude = meeting.members[user.phone].longitude;
    } else {
      latitude = user.location.latitude;
      longitude = user.location.longitude;
    }

    return { latitude, longitude };
  }

  async loadSubpoint() {

    console.log(this.meeting.subpoints[this.subpointGroup]);

    if (this.subpointGroup !== null) {
      if (this.meeting.subpoints[this.subpointGroup].location.latitude !== undefined) {

        const lat = this.meeting.subpoints[this.subpointGroup].location.latitude;
        const lng = this.meeting.subpoints[this.subpointGroup].location.longitude;

        this.subpointRadius = this.mapService.drawSubpointRadius(lat, lng);

        this.subpointRadius.setMap(this.map);

        this.markers.push(new google.maps.Marker({
          title: 'Subpoint',
          position: {
            lat: this.meeting.subpoints[this.subpointGroup].location.latitude,
            lng: this.meeting.subpoints[this.subpointGroup].location.longitude,
          },
          icon: '../../../../assets/pin.png',
          map: this.map,
        }));
      }
    }


    // console.log(this.origins);
    // await this.calcRoute();

    // });

  }

  setInfoWindow(marker) {
    const infoWindow = new google.maps.InfoWindow({
      content: marker.title
    });

    google.maps.event.addListener(marker, 'click', function () {
      infoWindow.open(this.map, marker);
    });
  }

  async getMarkers() {
    this.markers.forEach(marker => {
      this.setInfoWindow(marker);
    })
  }

  async loadMap() {

    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCQW7UBbaXZdVAmA0RizRc3XqST8hpUrvQ',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCQW7UBbaXZdVAmA0RizRc3XqST8hpUrvQ'
    });

    this.map = new google.maps.Map(this.mapElement, {
      zoom: 6,
      center: { lat: -23.4558009, lng: -46.5322912 },
      disableDefaultUI: true,
    });

    this.googleMapsDisplay.setMap(this.map);
    this.googleMapsDisplay.setOptions({ suppressMarkers: true });

  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async getRoutes() {

    const { latitude, longitude } = this.getLatLng(this.user, this.meeting);

    let waypts = [];

    if (this.subpointGroup !== null) {
      if (this.meeting.subpoints[this.subpointGroup].location.members && this.meeting.subpoints[this.subpointGroup].location.members[this.user.phone]) {
        if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(latitude, longitude), this.subpointRadius)) {
          this.meeting.subpoints[this.subpointGroup].location.members[this.user.phone] = false;
        } else {
          waypts.push({
            location: {
              lat: this.meeting.subpoints[this.subpointGroup].location.latitude,
              lng: this.meeting.subpoints[this.subpointGroup].location.longitude
            },
            stopover: true
          });
        }
      }
    }

    await this.googleMapsDirections.route({
      origin: {
        lat: latitude,
        lng: longitude,
      },
      destination: this.destination.getPosition(),
      travelMode: this.travelMode,
      waypoints: waypts,
      // optimizeWaypoints: true,
    }).then(async result => {

      let duration = 0;

      result.routes[0].legs.forEach(route => {
        duration += Math.round(route.duration.value / 60);
      });

      console.log(`Faltam ${duration} minutos`);

      this.meeting.members[this.user.phone].duration = duration;
      this.meeting.members[this.user.phone].travelMode = this.travelMode;
      this.meeting.members[this.user.phone].updatedAt = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      await this.meetingService.update(this.meeting.id, this.meeting);

      this.googleMapsDisplay.setDirections(result);
    
    }).catch(async err => {
      return await this.presentToast('Problemas ao encontrar uma rota para esta localização');
    });

  }

  async refresh() {

    try {
      this.refreshFlag = true;
      await this.loadMeeting();
      await this.clearMapObjects();
      await this.loadMapObjects();
    } catch (error) {
      console.error(error);
    } finally {
      this.refreshFlag = false;
    }

  }

  clearMapObjects() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });

    this.myOrigin.setMap(null);

    this.markers = [];
  }

  async changeTravelMode(event) {
    if (this.travelModeAux === null) {
      this.travelMode = event.detail.value;
      this.travelModeAux = event.detail.value;
      return;
    }

    await this.loadMeeting();

    this.travelMode = event.detail.value;
    this.getRoutes();
  }

}

