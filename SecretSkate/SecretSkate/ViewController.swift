//
//  ViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/12/21.
//

import UIKit
import Alamofire
import MapKit

class ViewController: UIViewController {

    struct MapPoint {
        var name: String
        var lattitude: Double
        var longtitude: Double
        
        init(name: String, lat: CLLocationDegrees, lon: CLLocationDegrees) {
            self.name = name
            self.lattitude = lat
            self.longtitude = lon
        }
    }
    
    @IBOutlet weak var usernameField: UITextField!
    
    @IBOutlet weak var passwordField: UITextField!
    
    @IBOutlet weak var bannerMessage: UILabel!
    
    @IBOutlet weak var userMap: MKMapView!
    
    let locationManager = CLLocationManager()
    
    
    @IBAction func loginSubmit(_ sender: UIButton) {
        if (self.passwordField.text == "" || self.usernameField.text == "") {
            self.bannerMessage.text = "provide a username and password"
            return
        }
        else {
            func afterPostRequest(data: NSDictionary) -> Void {
                let defaults = UserDefaults.standard
                defaults.set(data["token"], forKey: "secretSkateToken")
                self.bannerMessage.text = "Shhh, welcome to S K A T E S E C R E T S"
            }
            func errorAfterPostRequest(data: NSDictionary) -> Void {
                self.bannerMessage.text = data["message"] as? String                
            }
            let data: [String: Any] = ["username": self.usernameField.text as Any, "password": self.passwordField.text as Any]
            Networking().makeRequest(method: .post , url:"http://localhost:8000/login", data: data, handler: afterPostRequest(data:), errorHandler: errorAfterPostRequest(data:))
            }
        }
    
    @IBAction func searchNearby(_ sender: Any) {
        let data: [String: Any] = ["lat": 37.6777944601983, "lon": -122.07334077053154, "searchRadius": 10]
        func handler(data: NSDictionary) -> Void {
            let wrappedListofUsers = data["searchResults"] as? [[String: Any]]
            if let listOfUsers = wrappedListofUsers {
                var userLocations: [MapPoint] = []
                for user in listOfUsers {
                    let mapPoint = MapPoint(name: user["username"] as! String, lat: (user["lat"] as! NSString).doubleValue, lon: (user["lon"] as! NSString).doubleValue)
                    userLocations.append(mapPoint)
                }
                for mapPoint in userLocations {
                    let annotations = MKPointAnnotation()
                    annotations.title = mapPoint.name
                    annotations.coordinate = CLLocationCoordinate2D(latitude: mapPoint.lattitude, longitude: mapPoint.longtitude)
                    userMap.addAnnotation(annotations)
                }
            }
        }
        func errorHandler(data: NSDictionary) -> Void {
            self.bannerMessage.text = data["message"] as? String
        }
        Networking().makeRequest(method: .post, url: "http://localhost:8000/getNearbyUsers", data: data, handler: handler(data:), errorHandler: errorHandler(data:))
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        // prepare json data
        if CLLocationManager.locationServicesEnabled() {
            checkAuthorizationStatus()
        }
        self.usernameField.text = "xen"
        self.passwordField.text = "password"

        
    }
    
    func checkAuthorizationStatus() {
      switch CLLocationManager.authorizationStatus() {
        case .authorizedWhenInUse:
            self.userMap.showsUserLocation = true
            break
        case .denied: break
        case .notDetermined: break
        case .restricted: break
        case .authorizedAlways:
            self.userMap.showsUserLocation = true
            break
      }
    }
}



