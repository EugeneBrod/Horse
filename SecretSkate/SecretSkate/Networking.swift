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
        //alter data???
        AF.request(url, method: method, parameters: data, encoding: JSONEncoding.default)
                    .responseJSON { response in
        //to get status code
                        
                        if let status = response.response?.statusCode {
                            switch(status){
                            case 200:
                                let result = response.value
                                let JSON = result as! NSDictionary
                                handler(JSON)
                            default:
                                let result = response.value
                                let JSON = result as! NSDictionary
                                errorHandler(JSON)
                            }
                        }
                }
    }
}

