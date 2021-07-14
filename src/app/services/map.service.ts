import { Injectable } from '@angular/core';
import { IMeeting } from '../interfaces/Meeting';
import { MeetingService } from './meeting.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import watchers from 'src/environments/globals';
import { IUser } from '../interfaces/User';

declare var google;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private googleMapsDirections = new google.maps.DirectionsService();

  constructor(
    private meetingService: MeetingService,
    private geolocation: Geolocation
  ) { }

  async checkActiveLocations(user: IUser) {

    const groups = user.groups;

    if (Object.keys(groups).length !== 0) {

      Object.keys(groups).forEach(async group => {

        if (groups[group].myLocation === true) {

          if (watchers[group] === undefined) {

            const watcher = await this.getCurrentPosition(group, user);

            watchers[group] = watcher;

          }

        } else {

          if (watchers[group] !== undefined) {

            watchers[group].unsubscribe();

            // await this.resetAddressInMeeting(user, group);

          }

        }

      });
    }

  }

  async resetAddressInMeeting(user: IUser, meetingId: string) {
    let meeting: IMeeting;

    await this.meetingService.getById(meetingId).get().toPromise().then(response => {
      meeting = response.data();
    });

    // const subpointGroup = await this.meetingService.getSubpointGroup(meetingId);

    delete meeting.members[user.phone].latitude;
    delete meeting.members[user.phone].longitude;

    await this.meetingService.update(meetingId, meeting);

  }

  async getCurrentPosition(meetingId, user) {

    const watcher = this.geolocation.watchPosition({ enableHighAccuracy: true, maximumAge: 60000, timeout: 60000 }).subscribe((response: any) => {

      console.log('Getting position...');

      const { latitude, longitude } = response.coords;

      this.getRoute(meetingId, user, { latitude, longitude });

    });

    return watcher;

  }

  circlePath(center, radius, points){
    let a = [];
    let p = 360/points;
    let d = 0;

    for(let i=0; i<points; ++i, d+=p){
        a.push(google.maps.geometry.spherical.computeOffset(center, radius, d));
    }
    return a;
  }

  drawSubpointRadius(lat, lng){
    return new google.maps.Polygon({
      paths: this.circlePath(new google.maps.LatLng(lat, lng), 100, 360),
      strokeColor: "#F00",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: "#F00",
      fillOpacity: 0.35,
      clickable: true,
    });
  }

  async getRoute(meetingId, user, coords) {

    let meeting: IMeeting = null;

    await this.meetingService.getById(meetingId).get().toPromise().then(data => {
      meeting = data.data();
    });

    const subpointGroup: any = await this.meetingService.getSubpointGroup(meeting.id);

    // let latitude = null;
    // let longitude = null;

    // if (meeting.members[user.phone].latitude) {
    //   latitude = meeting.members[user.phone].latitude;
    //   longitude = meeting.members[user.phone].longitude;
    // } else {
    //   latitude = user.location.latitude;
    //   longitude = user.location.longitude;
    // }

    const { latitude, longitude } = coords;

    let waypts = [];

    
    if (subpointGroup !== null) {
      const location = meeting.subpoints[subpointGroup].location;
      if (location.members && location.members[user.phone] && location.latitude !== undefined) {

        const lat = location.latitude;
        const lng = location.longitude;

        const subpointRadius = this.drawSubpointRadius(lat, lng);

        if(google.maps.geometry.poly.containsLocation(new google.maps.LatLng(latitude, longitude), subpointRadius)) {
          meeting.subpoints[subpointGroup].location.members[user.phone] = false;
        } else {
          waypts.push({
            location: {
              lat: location.latitude,
              lng: location.longitude
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
      destination: {
        lat: meeting.location.latitude,
        lng: meeting.location.longitude,
      },
      travelMode: meeting.members[user.phone].travelMode,
      waypoints: waypts,

    }).then(async result => {

      let duration = 0;

      result.routes[0].legs.forEach(route => {
        duration += Math.round(route.duration.value / 60);
      });

      meeting.members[user.phone].duration = duration;
      meeting.members[user.phone].latitude = latitude;
      meeting.members[user.phone].longitude = longitude;
      meeting.members[user.phone].updatedAt = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      await this.meetingService.update(meeting.id, meeting);

    });

  }

}
