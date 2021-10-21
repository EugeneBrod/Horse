//
//  ViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/12/21.
//

import UIKit
import MapKit

class ViewController: UIViewController {


    
    @IBOutlet weak var usernameField: UITextField!
    
    @IBOutlet weak var passwordField: UITextField!
    
    @IBOutlet weak var bannerMessage: UILabel!
    
    @IBAction func loginSubmit(_ sender: UIButton) {
        if (self.passwordField.text == "" || self.usernameField.text == "") {
            self.bannerMessage.text = "provide a username and password"
            return
        }
        else {
            func afterPostRequest(data: NSDictionary) -> Void {
                let defaults = UserDefaults.standard
                defaults.set(data["token"], forKey: "secretSkateToken")
                UserSingleton.setup(config: UserSingleton.Config(
                                        username: data["username"] as! String,
                                        stance: data["stance"] as! String,
                                        rep: data["rep"] as! Int,
                                        date_created: String((data["date_created"] as! String).prefix(10)),
                                        user_id: data["user_id"] as! Int64 ))
                ViewTransition.goTo(currentVC: self, newVC: "HomeViewController")

            }
            func errorAfterPostRequest(data: NSDictionary) -> Void {
                self.bannerMessage.text = data["message"] as? String                
            }
            let data: [String: Any] = ["username": self.usernameField.text as Any, "password": self.passwordField.text as Any]
            Networking().makeRequest(method: .post , url:"http://localhost:8000/login", data: data, handler: afterPostRequest(data:), errorHandler: errorAfterPostRequest(data:))
            }
        }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        // prepare json data
        self.usernameField.text = "xen"
        self.passwordField.text = "password"
    }
}



