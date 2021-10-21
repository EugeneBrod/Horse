//
//  Location.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/19/21.
//

import Foundation
import CoreLocation

class Location {
    
    let locationManager = CLLocationManager()

    
    
    
    
    
    
    func checkAuthorizationStatus() {
      switch CLLocationManager.authorizationStatus() {
        case .authorizedWhenInUse:
            break
        case .denied:
            break
        case .notDetermined:
            break
        case .restricted:
            break
        case .authorizedAlways:
            break
      }
    }
    
}
