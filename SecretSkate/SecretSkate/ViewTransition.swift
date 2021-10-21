//
//  ViewTransition.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/20/21.
//

import Foundation
import UIKit

class ViewTransition {
    
    class func goTo(currentVC: UIViewController, newVC: String) {
        let storyBoard : UIStoryboard = UIStoryboard(name: "Main", bundle:nil)
        let nextViewController = storyBoard.instantiateViewController(withIdentifier: newVC) as UIViewController
        nextViewController.modalPresentationStyle = .fullScreen
        currentVC.present(nextViewController, animated:true, completion:nil)
    }
    
}
