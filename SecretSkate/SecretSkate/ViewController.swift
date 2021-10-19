//
//  ViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/12/21.
//

import UIKit
import Alamofire

class ViewController: UIViewController {

    @IBOutlet weak var usernameField: UITextField!
    
    @IBOutlet weak var passwordField: UITextField!
    
    @IBOutlet weak var bannerMessage: UILabel!
    
    @IBOutlet weak var searchResults: UILabel!
    
    
    @IBAction func loginSubmit(_ sender: UIButton) {
        if (self.passwordField.text == "" || self.usernameField.text == "") {
            self.bannerMessage.text = "provide a username and password"
            return
        }
        else {
            func afterPostRequest(data: NSDictionary) -> Void {
                let defaults = UserDefaults.standard
                defaults.set(data["token"], forKey: "secretSkateToken")
            }
            func errorAfterPostRequest(data: NSDictionary) -> Void {
                self.bannerMessage.text = data["message"] as? String                
            }
            let data: [String: Any] = ["username": self.usernameField.text, "password": self.passwordField.text]
            Networking().makeRequest(method: .post , url:"http://localhost:8000/login", data: data, handler: afterPostRequest(data:), errorHandler: errorAfterPostRequest(data:))
            }
        }
    
    @IBAction func searchNearby(_ sender: Any) {
        let data: [String: Any] = ["lat": 37.6777944601983, "lon": -122.07334077053154, "searchRadius": 10]
        func handler(data: NSDictionary) -> Void {
            let wrappedListofUsers = data["searchResults"] as? [[String: Any]]
            if let listOfUsers = wrappedListofUsers {
                var result: String = ""
                for user in listOfUsers {
                    result = result + (user["username"] as! String) + " "
                }
                self.searchResults.text = result
                print(result)
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
        
        

        
    }
}



