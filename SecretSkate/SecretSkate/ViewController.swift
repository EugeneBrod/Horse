//
//  ViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/12/21.
//

import UIKit
import Alamofire

class ViewController: UIViewController {

    @IBOutlet weak var urlTest: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        // prepare json data
        urlTest.text = "hello"
        
        func bannerMessage(data: NSDictionary) -> Void {
            self.urlTest.text = data["message"] as! String
        }
        
        let datas: [String: Any] = ["username": "xen", "password": "password"]
        
        let result = makeRequest(method: .post , url:"http://localhost:8000/login", data: datas, handler: bannerMessage)

        
    }


}

func makeRequest(method: HTTPMethod, url: String, data: [String:Any], handler: @escaping (NSDictionary) -> Void) {
    //alter data???
    AF.request(url, method: method, parameters: data, encoding: JSONEncoding.default)
                .responseJSON { response in
    //to get status code
                    if let status = response.response?.statusCode {
                        switch(status){
                        case 200:
                            if let result = response.value {
                                let JSON = result as! NSDictionary
                                handler(JSON)
                            }
                        default:
                            print("error with response status: \(status)")
                        }
                    }
            }
    
}

