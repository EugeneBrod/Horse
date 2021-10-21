//
//  HomeViewController.swift
//  SecretSkate
//
//  Created by Eugene Brodsky on 10/20/21.
//

import UIKit

class HomeViewController: UIViewController {

    @IBOutlet weak var usernameBanner: UILabel!
    @IBOutlet weak var aboutUserBanner: UILabel!
    
    @IBAction func mapButton(_ sender: Any) {
        ViewTransition.goTo(currentVC: self, newVC: "MapViewController")
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        usernameBanner.text = UserSingleton.shared.username
        let user = UserSingleton.shared
        aboutUserBanner.numberOfLines = 0
        aboutUserBanner.text = "rep: " + String(user.rep) + "\n" + "stance: " + user.stance + "\n" + "member since: " + String(user.date_created)
        // Do any additional setup after loading the view.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
