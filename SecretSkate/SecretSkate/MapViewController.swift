//
//  HomeViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/20/21.
//

import UIKit
import MapKit

class MapViewController: UIViewController {

    @IBOutlet weak var bannerMessage: UILabel!
    @IBOutlet weak var userMap: MKMapView!
    
    @IBAction func searchUsers(_ sender: Any) {
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
    

    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
