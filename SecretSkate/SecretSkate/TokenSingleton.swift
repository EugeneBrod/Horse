//
//  Token.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/18/21.
//

class TokenSingleton {

    static let shared = TokenSingleton()
    
    let token: String

    struct Config {
        var token:String
    }
    private static var config:Config?

    class func setup(_ config:Config){
        TokenSingleton.config = config
    }

    private init() {
        guard let config = TokenSingleton.config else {
            fatalError("Error - you must call setup before accessing TokenSingleton.shared")
        }
        token = config.token

        //Regular initialisation using config
    }
    
    func getToken() -> String {
        return token
    }
}
