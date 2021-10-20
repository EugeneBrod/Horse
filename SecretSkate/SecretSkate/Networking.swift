//
//  Networking.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/14/21.
//

import Foundation
import Alamofire

class Networking {
    
    func makeRequest(method: HTTPMethod, url: String, data: [String:Any], handler: @escaping (NSDictionary) -> Void, errorHandler: @escaping (NSDictionary) -> Void) {
        // add session token if it exists
        var alteredData = data
        let defaults = UserDefaults.standard
        if let token = defaults.string(forKey: "secretSkateToken") {
            alteredData["token"] = token
            
        }
        
        AF.request(url, method: method, parameters: alteredData, encoding: JSONEncoding.default)
                    .responseJSON { response in
                        switch response.result {
                                 case .success:
                                    let result = response.value
                                    let JSON = result as! NSDictionary
                                    if let status = response.response?.statusCode {
                                        switch(status){
                                        case 200..<300:
                                            handler(JSON)
                                        default:
                                            errorHandler(JSON)
                                        }
                                    }
                                 case .failure(let error):
                                    print(error)
                                 }
        }
    }
}

