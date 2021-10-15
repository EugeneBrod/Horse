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
    
    @IBAction func loginSubmit(_ sender: UIButton) {
        if (self.passwordField.text == "" || self.usernameField.text == "") {
            self.bannerMessage.text = "provide a username and password"
            return
        }
        else {
            func afterPostRequest(data: NSDictionary) -> Void {
                
            }
            
            let datas: [String: Any] = ["username": self.usernameField.text, "password": self.passwordField.text]
            
            let networking = Networking()
            
            /*
            do {
                try networking.makeRequest(method: .post , url:"http://localhost:8000/login", data: datas, handler: afterPostRequest(data:))
                catch {
                    self.bannerMessage.text =
                }
 */
            }
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        // prepare json data
        
        

        
    }


}



