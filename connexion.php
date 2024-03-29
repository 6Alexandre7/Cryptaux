<!DOCTYPE html>
<html lang="fr">
   <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- Polices d'écritures -->
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <!-- Icônes Bootstrap -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
      <title>Cryptaux - Connexion</title>
      <link rel="stylesheet" href="src/styles/style.css">
      <link rel="stylesheet" href="src/styles/connexion.css">
      <link rel="stylesheet" media="screen and (max-width: 1024px)" href="src/styles/mobile/connexion_mobile.css"/>
   </head>
   <body>
      <?php 
         // Récupérer le PDO
         require('src/backend/connect_database.php');
         
         // Démarer la session
         session_start();
      ?>
      <aside>
      <p id="logo" class="logo-mobile">Cryp<span id="logo-orange">Taux</span></p>
         <section class="form-container">
            <form method="post">
               <h1 id="form-title">Connexion</h1>
               <div class="form-input">
                  <input class="user-input" type="mail" name="mail" placeholder="" value="" required="required" autofocus>
                  <label for="username">Adresse mail</label>
               </div>
               <div class="form-input password-input">   
                  <input class="user-input" type="password" name="password" value=""  required="required">
                  <label for="password">Mot de passe</label>
                  <i id="eye-hide" class="icon-eye-hide bi bi-eye-slash" style="visibility: hidden;"></i>
                  <i id="eye-show" class="icon-eye-show bi bi-eye" style="visibility: hidden;"></i>
               </div>
               <?php
               // Le formulaire a été envoyé
               if (!empty($_POST)) {
                  // Récupérer les données du formulaire
                  $mail_user = $_POST["mail"];
                  $password_user = $_POST["password"];

                  // La personne est-elle dans la base de données ?
                  $is_inscrit = $db->query("SELECT count(mail) FROM cryptaux WHERE mail='$mail_user'")->fetchColumn();
                  
                  // L'utilisateur est inscrit
                  if ($is_inscrit > 0) {
                     $reponse=$db->query("SELECT password FROM cryptaux WHERE mail='$mail_user'")->fetchAll(PDO::FETCH_OBJ);
                     $password = $reponse[0]->password;
                  
                     if (password_verify($password_user, $password)) {
                        // Accéder au nom d'utilisateur et aux favs
                        $reponse=$db->query("SELECT username, favs FROM cryptaux WHERE mail='$mail_user'")->fetchAll(PDO::FETCH_OBJ);
                        
                        $username = $reponse[0]->username;
                        $favs = $reponse[0]->favs;

                        $_SESSION['username'] = $username;
                        $_SESSION['mail'] = $mail_user;
                        $_SESSION['favs'] = $favs;

                        // Enregistrer la date de connexion
                        $date_login = date('d/m/Y à H:i:s');
                        $db->query("INSERT INTO login_date(id, mail, timestamp) VALUES(DEFAULT, '$mail_user', '$date_login')");

                        // Redirection vers la page d'accueil
                        header("Location: index.php");
                        exit();
                     } else {
                        // Mot de passe incorrect                     
                        echo "<p class='error-message'>Adresse mail ou mot de passe incorrect.</p>";
                     }
                  } else {
                     // Rediriger l'utilisateur vers la page d'inscription
                     header("Location: inscription.php");
                  }
               }
               ?>
               <div class="form-input">
                  <input class="submit-disabled" type="submit" value="Se connecter">
                  <p class="have-account-redirection">Vous n'avez pas de compte ? <a href="inscription.php">Inscrivez-vous</a></p>
               </div>
            </form>
            <p class="text-bottom-creator-logo">EHRHARD Alexandre & ECKSTEIN Théo</p>
         </section>
      </aside>
      <div id="hero-banner">
         <div class="hero-banner-container">
            <h2 id="hero-banner-slogan">L’outil idéal<br>pour les<br>crypto-monnaies.</h2>
            <p id="hero-banner-text">Consultez en temps réel le cours, la capitalisation boursière et les graphiques de plus de 13000 crypto-monnaies. Rejoignez-nous pour suivre leurs fluctuations ou en apprendre plus sur elles.</p>
         </div>
         <p id="logo" class="text-bottom-creator-logo">Cryp<span id="logo-orange">Taux</span></p>
      </div>
      <script src="src/scripts/Connexion.js"></script>
   </body>
</html>