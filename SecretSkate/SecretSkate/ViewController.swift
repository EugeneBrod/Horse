//
//  ViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/12/21.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var urlTest: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        // prepare json data
        urlTest.text = "hello"
        let json: [String: Any] = ["username": "xen",
                                   "password": "password"]

        struct MyObject: Codable {
            let username: String
            let password: String
        }
        
        let dictionary = ["object-1": MyObject(username: "xen", password: "password")]
        
        let encodedDictionary = try! JSONEncoder().encode(dictionary)
        // create post request
        let url = URL(string: "http://localhost:8000/login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        // insert json data to the request
        request.httpBody = encodedDictionary

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data, error == nil else {
                print(error?.localizedDescription ?? "No data")
                self.urlTest.text = error?.localizedDescription
                return
            }
            let responseJSON = try? JSONSerialization.jsonObject(with: data, options: [])
            if let responseJSON = responseJSON as? [String: Any] {
                self.urlTest.text = responseJSON.description
            }
        }

        task.resume()
    }


}

