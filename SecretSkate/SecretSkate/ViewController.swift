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
                TokenSingleton.setup(TokenSingleton.Config(token: data["token"] as! String))
                
            }
            func errorAfterPostRequest(data: NSDictionary) -> Void {
                self.bannerMessage.text = data["message"] as! String
            }
            
            
            let data: [String: Any] = ["username": self.usernameField.text, "password": self.passwordField.text]
            
            
            
            Networking().makeRequest(method: .post , url:"http://localhost:8000/login", data: data, handler: afterPostRequest(data:), errorHandler: errorAfterPostRequest(data:))

            }
        }
    
    @IBAction func searchNearby(_ sender: Any) {
        let data: [String: Any] = ["token": TokenSingleton.shared.getToken(), "lat": 37.6777944601983, "lon": -122.07334077053154, "searchRadius": 10]


        func handler(data: NSDictionary) -> Void {
            let listOfUsers = data["searchResults"] as? [NSDictionary]
            for user in listOfUsers ?? [] {
                var result = ""
                result = result + user.description
                self.searchResults.text = result
            }
            debugPrint(data["searchResults"])
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



