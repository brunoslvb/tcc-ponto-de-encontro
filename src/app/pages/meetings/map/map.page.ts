import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingController, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, Environment, GoogleMapsAnimation, ILatLng, Polygon, Poly } from '@ionic-native/google-maps';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute } from '@angular/router';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import { IUser } from 'src/app/interfaces/User';

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
  private map: GoogleMap;
  private googleMapsDirections = new google.maps.DirectionsService();
  private origins: Marker[];
  private destination: Marker;
  private travelMode: string = "DRIVING";

  private subpointGroup: any;

  private users = [];

  private groupedUsers = [];

  private group1Vertices = null;
  private group2Vertices = null;
  private group3Vertices = null;
  private group4Vertices = null;

  constructor(
    private nav: NavController,
    private loadingController: LoadingController,
    private platform: Platform,
    private statusBar: StatusBar,
    private meetingService: MeetingService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.statusBar.overlaysWebView(true);

    // this.loadMap();
  }

  ionViewWillEnter() {
    this.load();
  }

  ionViewDidLeave() {
    this.statusBar.styleDefault();
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString('#d3d6e7');
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

    await this.loadMeeting();
    await this.loadUser();
    await this.loadUsers();
    await this.loadMap();

  }

  async loadMeeting() {
    const id = this.route.snapshot.paramMap.get("id");

    try {

      await this.meetingService.getById(id).get().toPromise().then(async response => {

        const data: any = response.data();

        this.meeting = data;

        this.meeting.id = response.id;

        this.subpointGroup = await this.meetingService.getSubpointGroup(this.meeting.id); 

      });

    } catch (error) {
      console.error(error);
    }
  }

  async loadUser() {

    try {

      await this.userService.getById(this.user.phone).snapshotChanges().subscribe(async response => {

        const data: any = response.payload.data();

        this.user = data;

      });

    } catch (error) {
      console.error(error);
    }
  }

  async loadUsers() {
    const promises = this.meeting.members.map(member => this.userService.getById(member).get().toPromise().then(response => response.data()));

    await Promise.all(promises).then(async (response) => {
      this.users = response.map((user: any) => user);
    });
  }

  async loadDestination() {

    console.log(this.meeting);

    this.destination = this.map.addMarkerSync({
      title: this.meeting.location.address,
      icon: this.colorMarker,
      animation: GoogleMapsAnimation.BOUNCE,
      position: {
        lat: this.meeting.location.latitude,
        lng: this.meeting.location.longitude,
      }
    });

    const { lat, lng } = this.destination.getPosition();

    const yOffset = 85;
    const xOffset = 50;

    this.group1Vertices = [
      { lat, lng },
      { lat: lat + (yOffset - lat), lng },
      { lat: lat + (yOffset - lat), lng: lng + xOffset },
      { lat, lng: lng + xOffset }
    ];

    //group1 lat > t.lat ; lng > t.lng
    await this.map.addPolygon({
      points: this.group1Vertices,
      strokeColor: "transparent",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: "transparent",
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

    await this.map.addPolygon({
      points: this.group2Vertices,
      strokeColor: "transparent",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: "transparent",
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

    await this.map.addPolygon({
      points: this.group3Vertices,
      strokeColor: "transparent",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: "transparent",
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

    await this.map.addPolygon({
      points: this.group4Vertices,
      strokeColor: "transparent",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: "transparent",
      fillOpacity: 0.35,
      clickable: true
    });

  }

  async joinUsersInSameArea() {

    let members = this.users;

    const group1 = {
      id: 'group1',
      location: this.meeting.subpoints.group1.location ? this.meeting.subpoints.group1.location : {},
      suggestion: this.meeting.subpoints.group1.suggestion ? this.meeting.subpoints.group1.suggestion : {pending: false, votes: {}},
      members: []
    }

    const group2 = {
      id: 'group2',
      location: this.meeting.subpoints.group1.location ? this.meeting.subpoints.group2.location : {},
      suggestion: this.meeting.subpoints.group1.suggestion ? this.meeting.subpoints.group2.suggestion : {pending: false, votes: {}},
      members: []
    }

    const group3 = {
      id: 'group3',
      location: this.meeting.subpoints.group1.location ? this.meeting.subpoints.group3.location : {},
      suggestion: this.meeting.subpoints.group1.suggestion ? this.meeting.subpoints.group3.suggestion : {pending: false, votes: {}},
      members: []
    }

    const group4 = {
      id: 'group4',
      location: this.meeting.subpoints.group1.location ? this.meeting.subpoints.group4.location : {},
      suggestion: this.meeting.subpoints.group1.suggestion ? this.meeting.subpoints.group4.suggestion : {pending: false, votes: {}},
      members: []
    }

    for (let i = 0; i < members.length; i++) {

      const data = {
        phone: members[i].phone,
      }

      if (Poly.containsLocation({ lat: members[i].location.latitude, lng: members[i].location.longitude }, this.group1Vertices)) {
        group1.members.push(data);
        continue;
      }

      if (Poly.containsLocation({ lat: members[i].location.latitude, lng: members[i].location.longitude }, this.group2Vertices)) {
        group2.members.push(data);
        continue;
      }

      if (Poly.containsLocation({ lat: members[i].location.latitude, lng: members[i].location.longitude }, this.group3Vertices)) {
        group3.members.push(data);
        continue;
      }

      if (Poly.containsLocation({ lat: members[i].location.latitude, lng: members[i].location.longitude }, this.group4Vertices)) {
        group4.members.push(data);
        continue;
      }

    }

    // const promises = this.meeting.members.map(member => this.userService.getById(member).get().toPromise().then(response => response.data()));

    // Promise.all(promises).then(async (response) => {

    // this.users.forEach((user: any) => {

    //   if (Poly.containsLocation({ lat: user.location.latitude, lng: user.location.longitude }, area)) {
    //     this.groupedUsers.push(user);
    //   }

    // });

    console.log('group1', group1);
    console.log('group2', group2);
    console.log('group3', group3);
    console.log('group4', group4);

    console.log(this.meeting);

    const data = {
      subpoints: {
        group1,
        group2,
        group3,
        group4
      }
    }

    console.log({...data, ...this.meeting});
    

    // delete data.id;
    
    await this.meetingService.update(this.meeting.id, data);

    // this.getBiggerDistance();

    // const lala = lolo.sort((a, b) => a.location.distance - b.location.distance);
    // console.log(lala);

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

    if(distances.length > 1){
      response = distances.sort((a, b) => a.location.distance - b.location.distance)[distances.length - 1];
    } else {
      response = distances[0];
    }

    console.log(response);

    return response;

  }


  async teste() {
    const response: any = await this.getBiggerDistance();
    console.log(response);
    console.log('response');

    response.forEach(element => {
      console.log(element);
    });


  }

  async loadOrigins() {

    this.origins = this.users.map((user: any) => {

      return this.map.addMarkerSync({
        title: user.name,
        icon: this.colorMarker,
        animation: GoogleMapsAnimation.BOUNCE,
        position: {
          lat: user.location.latitude,
          lng: user.location.longitude,
        }
      });

    });

    // console.log(this.origins);
    // await this.calcRoute();

    // });

  }

  async loadSubpoint() {

    await this.map.addMarkerSync({
      title: 'Subpoint',
      // icon: {
      //   url: "../../../../assets/bruno.jpg",
      //   size: {
      //     width: 40,
      //     height: 40
      //   },
      // },
      icon: 'red',
      animation: GoogleMapsAnimation.BOUNCE,
      position: {
        lat: this.meeting.subpoints[this.subpointGroup].location.latitude,
        lng: this.meeting.subpoints[this.subpointGroup].location.longitude,
      }
    });


    // console.log(this.origins);
    // await this.calcRoute();

    // });

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
        zoom: false,
      },
      camera: {
        zoom: 6,
        target: {lat: -23.4558009, lng: -46.5322912}
      },
    };

    this.map = GoogleMaps.create(this.mapElement, mapOptions);

    try {
      await this.map.one(GoogleMapsEvent.MAP_READY);

      await this.loadDestination();
      await this.loadOrigins();
      await this.joinUsersInSameArea();
      await this.loadSubpoint();
      // console.log(this.groupedUsers);

      await this.getRoutes();

    } catch (error) {
      console.log(error);
    } finally {
      this.loading.dismiss();
    }
  }

  refresh(ev) {
    console.log(ev);
  }

  async getRoutes() {
  
    console.log('Current group:', this.subpointGroup);
    
    let users = [];

    const promises = this.meeting.subpoints[this.subpointGroup].members.map(member => this.userService.getById(member.phone).get().toPromise().then(response => response.data()));

    await Promise.all(promises).then(response => {

      users = response.map((user: any) => user);

    });

    console.log(users);
    

    // for (const user of users) {

      const points = new Array<ILatLng>();
      
      let waypts = [];
      
      if(this.meeting.subpoints[this.subpointGroup].location.members[this.user.phone]){
        waypts.push({
          location: {
            lat: this.meeting.subpoints[this.subpointGroup].location.latitude,
            lng: this.meeting.subpoints[this.subpointGroup].location.longitude
          },
          stopover: true
        });
      }

      await this.googleMapsDirections.route({
        origin: {
          lat: this.user.location.latitude,
          lng: this.user.location.longitude,
        },
        destination: this.destination.getPosition(),
        travelMode: this.travelMode,
        waypoints: waypts,
        // optimizeWaypoints: true,
      }, async (response: any) => {
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

    // }


  }

  async calcRoute2() {

    // const origin = await this.getBiggerDistance();

    const points = new Array<ILatLng>();

    // const waypts = this.groupedUsers.filter(user => {      
    //   if(user !== origin){
    //     return user;
    //   }
    // }).map(user => {
    //   return {
    //     location: {lat: user.location.latitude, lng: user.location.longitude},
    //     stopover: true
    //   }
    // });

    // console.log('WAYPTS', waypts);
    

    // await this.googleMapsDirections.route({
    //   origin: {
    //     lat: origin.location.latitude,
    //     lng: origin.location.longitude,
    //   },
    //   destination: this.destination.getPosition(),
    //   travelMode: this.travelMode,
    //   // waypoints: waypts,
    //   // optimizeWaypoints: true,
    // }, async (response: any) => {
    //   response.routes[0].overview_path.forEach(path => {
    //     points.push({
    //       lat: path.lat(),
    //       lng: path.lng()
    //     });
    //   });

    //   await this.map.addPolyline({
    //     points: points,
    //     color: this.colorMarker,
    //     width: 3
    //   });

    //   this.map.moveCamera({
    //     target: points
    //   });
    // });

  }

  // async teste(){

  //   const promises = this.meeting.members.map(member => this.userService.getById(member).get().toPromise().then(response => response.data()));

  //   const obj = {};

  //   Promise.all(promises).then(async (data: any) => {  

  //     data.forEach(async item => {

  //       obj[item.name] = {}

  //       data.forEach(async item2 => {

  //         if(item !== item2){

  //           // console.log(`${item.name} => ${item2.name}`);

  //           await this.googleMapsDirections.route({
  //             origin: {
  //               lat: item.location.latitude,
  //               lng: item.location.longitude,
  //             },
  //             destination: {
  //               lat: item2.location.latitude,
  //               lng: item2.location.longitude,
  //             },
  //             travelMode: this.travelMode
  //           }, async (response: any) => {

  //             console.log(item);
  //             console.log(response.routes[0].legs[0].distance.value);

  //             obj[item.name][item2.name] = response.routes[0].legs[0].distance.value;

  //           });
  //         }
  //       });

  //       // console.log(obj);

  //       // const points = new Array<ILatLng>();

  //       // await this.googleMapsDirections.route({
  //       //   origin: {
  //       //     lat: item.location.latitude,
  //       //     lng: item.location.longitude,
  //       //   },
  //       //   destination: this.destination.getPosition(),
  //       //   travelMode: this.travelMode
  //       // }, async (response: any) => {

  //       //   console.log(item);
  //       //   console.log(response.routes[0].legs[0].distance.value);

  //       //   response.routes[0].overview_path.forEach(path => {
  //       //     points.push({
  //       //       lat: path.lat(),
  //       //       lng: path.lng()
  //       //     });
  //       //   });

  //         // await this.map.addPolyline({
  //         //   points: points,
  //         //   color: this.colorMarker,
  //         //   width: 3
  //         // });

  //         // this.map.moveCamera({
  //         //   target: points
  //         // });
  //       // });
  //     });

  //     // console.log(this.origins);
  //     // await this.calcRoute();
  //   });

  //   setTimeout(function(){
  //     var path = dijkstra.find_path(obj, 'Bárbara', 'Bruno');
  //     console.log(path);
  //   }, 10000);


  // }



}
