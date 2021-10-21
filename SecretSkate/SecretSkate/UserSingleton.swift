//
//  UserSingleton.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/21/21.
//

import Foundation

class UserSingleton {
    
    static let shared = UserSingleton()
    
    struct Config {
        var username: String
        var stance: String
        var rep: Int
        var date_created: String
        var user_id: Int64
    }
    
    private static var config: Config?
    
    class func setup(config: Config) {
        UserSingleton.config = config
    }
    
    var username: String
    var stance: String
    var rep: Int
    var date_created: String
    var user_id: Int64
    
    private init() {
        guard let config = UserSingleton.config else {
            fatalError("Error - you must call setup before accessing UserSingleton.shared")
        }
        self.username = config.username
        self.stance = config.stance
        self.rep = config.rep
        self.date_created = config.date_created
        self.user_id = config.user_id
    }
}
