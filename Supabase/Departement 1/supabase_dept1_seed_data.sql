-- ==================================================================
-- ADMINA_RH - Departement 1 : Donnees Seed (INSERT)
-- Administration et Gestion des Carrieres
-- Genere automatiquement - Donnees fictives camerounaises
-- Date: 2026-08-19 | Project Ref: vdlvxbwakbyzkhcrowiv
-- ==================================================================

-- ============================================================
-- NOTES D'UTILISATION
-- ============================================================
-- 1. Executer le schema DDL en premier (supabase_dept1_schema.sql)
-- 2. La table utilisateurs requiert un auth.users prealable
--    => On desactive temporairement la FK, puis on la reactive
-- 3. Les UUID sont deterministes (seed=42) pour reproductibilite
-- 4. Montants en FCFA, dates 2025-2026

-- ============================================================
-- SECTION 1: TENANT (1)
-- ============================================================

INSERT INTO public.tenants (id, nom, slug, pays, devise, adresse, telephone, email, logo_url, config, est_actif) VALUES
  ('8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Admina_RH - Societe Camerounaise', 'admina-rh-cameroun', 'Cameroun', 'FCFA', 'BP 12345 Douala, Cameroun', '+237 233 42 18 16', 'contact@admina-rh.cm', NULL, '{"langue": "fr", "fuseau": "Africa/Douala"}'::jsonb, TRUE);


-- ============================================================
-- SECTION 2: UTILISATEURS (20)
-- ============================================================
-- NOTE: Desactivation temporaire FK vers auth.users

ALTER TABLE public.utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_id_fkey;

INSERT INTO public.utilisateurs (id, tenant_id, matricule, nom, prenom, email, telephone, poste, departement, role, est_actif, dernier_login) VALUES
  ('a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1001', 'Jean-Pierre', 'Nkoulou', 'jean.nkoulou@admina-rh.cm', '+237 6924 13 45 41', 'Directeur Général', 'Direction Générale', 'admin', TRUE, NULL),
  ('8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1002', 'Marie-Claire', 'Tchinda', 'marie.tchinda@admina-rh.cm', '+237 6727 23 96 79', 'Chef de Service RH', 'Direction Administrative', 'rh', TRUE, NULL),
  ('768a2c7a-6505-4da8-b17c-54aa16e0c144', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1003', 'Alain', 'Nganou', 'alain.nganou@admina-rh.cm', '+237 6785 64 14 13', 'Comptable Senior', 'Service RH', 'drh', TRUE, NULL),
  ('e471524c-c96c-4f92-b75d-4646472b5f12', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1004', 'Béatrice', 'Eyenga', 'béatrice.eyenga@admina-rh.cm', '+237 6737 39 74 87', 'Développeur Full Stack', 'Service Comptabilité', 'employe', TRUE, NULL),
  ('e52815de-e256-4908-a3f7-3846bf22928e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1005', 'Emmanuel', 'Fotso', 'emmanuel.fotso@admina-rh.cm', '+237 6781 35 93 99', 'Agent Administratif', 'Département Informatique', 'employe', TRUE, NULL),
  ('738c1822-5167-4095-956c-0c449143b5aa', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1006', 'Florence', 'Kamga', 'florence.kamga@admina-rh.cm', '+237 6963 38 67 85', 'Gestionnaire de Paie', 'Pôle Logistique', 'employe', TRUE, NULL),
  ('21b86f22-2cdc-4838-b92c-de5819640114', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1007', 'Grégoire', 'Ngo Mbeck', 'grégoire.ngo_mbeck@admina-rh.cm', '+237 6810 30 99 64', 'Chargé de Recrutement', 'Service Commercial', 'employe', TRUE, NULL),
  ('71b9374d-7367-480c-a014-1ef4ed76a925', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1008', 'Hélène', 'Mbarga', 'hélène.mbarga@admina-rh.cm', '+237 6845 29 37 53', 'Responsable Logistique', 'Département Technique', 'employe', TRUE, NULL),
  ('07585e13-f3aa-47c9-aea2-fac28dde7595', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1009', 'Ibrahim', 'Atangana', 'ibrahim.atangana@admina-rh.cm', '+237 6721 58 22 55', 'Contrôleur de Gestion', 'Équipe Qualité', 'employe', TRUE, NULL),
  ('eff54922-b5c9-4f85-b803-73fd087bb0ec', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1010', 'Joséphine', 'Ndi', 'joséphine.ndi@admina-rh.cm', '+237 6887 43 15 68', 'Assistante de Direction', 'Service Juridique', 'employe', TRUE, NULL),
  ('430514dc-47e9-4063-a40f-3758c1f8b272', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1011', 'Karl', 'Tchouankeu', 'karl.tchouankeu@admina-rh.cm', '+237 6925 58 20 80', 'Technicien Maintenance', 'Direction Générale', 'employe', TRUE, NULL),
  ('aee9ebf0-b200-47c5-8b78-53017af9faa8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1012', 'Léontine', 'Ngassam', 'léontine.ngassam@admina-rh.cm', '+237 6890 89 56 83', 'Chef de Projet IT', 'Direction Administrative', 'employe', TRUE, NULL),
  ('33172891-3a55-40a2-8c3a-388593198e43', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1013', 'Maurice', 'Nsame', 'maurice.nsame@admina-rh.cm', '+237 6718 15 94 39', 'Analyste Programmateur', 'Service RH', 'employe', TRUE, NULL),
  ('74ee3fb7-be78-4423-802e-7cc2289d5bfe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1014', 'Nathalie', 'Moukouri', 'nathalie.moukouri@admina-rh.cm', '+237 6820 39 22 58', 'Agent de Sécurité', 'Service Comptabilité', 'employe', TRUE, NULL),
  ('b9385eb7-afdc-44c6-98c7-0f613884c6f2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1015', 'Olivier', 'Zang', 'olivier.zang@admina-rh.cm', '+237 6868 91 56 30', 'Conducteur', 'Département Informatique', 'employe', TRUE, NULL),
  ('4ca33199-e984-4fe5-b1cb-d1b6f3a1dc86', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1016', 'Patricia', 'Eyon', 'patricia.eyon@admina-rh.cm', '+237 6855 36 95 44', 'Directeur Général', 'Pôle Logistique', 'employe', TRUE, NULL),
  ('0128c069-0f86-41e8-bee0-146dbdff76fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1017', 'Quentin', 'Nkoum', 'quentin.nkoum@admina-rh.cm', '+237 6997 92 19 87', 'Chef de Service RH', 'Service Commercial', 'employe', TRUE, NULL),
  ('8e9f8477-315f-4aee-9263-e61491abee4b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1018', 'Rosalie', 'Nkoulou Mbarga', 'rosalie.nkoulou_mbarga@admina-rh.cm', '+237 6931 78 41 30', 'Comptable Senior', 'Département Technique', 'employe', TRUE, NULL),
  ('3158ea61-9bde-494b-bc18-7b8396ad486f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1019', 'Sylvain', 'Biya''a', 'sylvain.biyaa@admina-rh.cm', '+237 6858 44 91 98', 'Développeur Full Stack', 'Équipe Qualité', 'employe', TRUE, NULL),
  ('66734399-878a-4c45-9c52-e99d66294442', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ADM-1020', 'Thérèse', 'Ngwe', 'thérèse.ngwe@admina-rh.cm', '+237 6938 97 51 17', 'Agent Administratif', 'Service Juridique', 'employe', TRUE, NULL);


ALTER TABLE public.utilisateurs ADD CONSTRAINT utilisateurs_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- SECTION 3: EMPLOYES (20)
-- ============================================================

INSERT INTO public.employes (id, tenant_id, matricule, nom, prenom, date_naissance, lieu_naissance, sexe, nationalite, situation_familiale, nombre_enfants, adresse, telephone, email_personnel, email_professionnel, date_embauche, statut, photo_url, utilisateur_id) VALUES
  ('2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1001', 'Nkoulou', 'Jean-Pierre', '1979-02-25', 'Maroua', 'M', 'Camerounaise', 'marie(e)', 0, 'Yaoundé, Cameroun', '+237 6737 82 50 37', 'jean.nkoulou@gmail.com', 'jean.nkoulou@admina-rh.cm', '2025-05-08', 'actif', NULL, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1002', 'Tchinda', 'Marie-Claire', '1985-08-01', 'Bafoussam', 'F', 'Camerounaise', 'divorce(e)', 5, 'Yaoundé, Cameroun', '+237 6741 81 78 43', 'marie.tchinda@gmail.com', 'marie.tchinda@admina-rh.cm', '2024-07-22', 'actif', NULL, '8951e562-1f82-4b1b-b614-a1373bfa0c98'),
  ('a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1003', 'Nganou', 'Alain', '1981-03-28', 'Garoua', 'M', 'Camerounaise', 'veuf(ve)', 3, 'Douala, Cameroun', '+237 6973 21 16 24', 'alain.nganou@gmail.com', 'alain.nganou@admina-rh.cm', '2019-09-19', 'en_formation', NULL, '768a2c7a-6505-4da8-b17c-54aa16e0c144'),
  ('6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1004', 'Eyenga', 'Béatrice', '1983-12-09', 'Ébolowa', 'F', 'Camerounaise', 'marie(e)', 5, 'Douala, Cameroun', '+237 6858 86 69 77', 'béatrice.eyenga@gmail.com', 'béatrice.eyenga@admina-rh.cm', '2020-10-26', 'en_conge', NULL, 'e471524c-c96c-4f92-b75d-4646472b5f12'),
  ('3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1005', 'Fotso', 'Emmanuel', '1995-07-08', 'Bertoua', 'M', 'Camerounaise', 'celibataire', 0, 'Douala, Cameroun', '+237 6978 44 92 53', 'emmanuel.fotso@gmail.com', 'emmanuel.fotso@admina-rh.cm', '2019-04-02', 'actif', NULL, 'e52815de-e256-4908-a3f7-3846bf22928e'),
  ('ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1006', 'Kamga', 'Florence', '1985-05-09', 'Douala', 'F', 'Camerounaise', 'divorce(e)', 1, 'Bafoussam, Cameroun', '+237 6943 74 32 74', 'florence.kamga@gmail.com', 'florence.kamga@admina-rh.cm', '2019-03-12', 'en_formation', NULL, '738c1822-5167-4095-956c-0c449143b5aa'),
  ('1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1007', 'Ngo Mbeck', 'Grégoire', '1987-10-10', 'Ébolowa', 'M', 'Camerounaise', 'marie(e)', 5, 'Douala, Cameroun', '+237 6757 30 79 77', 'grégoire.ngo_mbeck@gmail.com', 'grégoire.ngo_mbeck@admina-rh.cm', '2018-01-03', 'en_conge', NULL, '21b86f22-2cdc-4838-b92c-de5819640114'),
  ('cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1008', 'Mbarga', 'Hélène', '1965-11-16', 'Yaoundé', 'F', 'Camerounaise', 'marie(e)', 3, 'Yaoundé, Cameroun', '+237 6840 17 40 82', 'hélène.mbarga@gmail.com', 'hélène.mbarga@admina-rh.cm', '2018-11-19', 'actif', NULL, '71b9374d-7367-480c-a014-1ef4ed76a925'),
  ('95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1009', 'Atangana', 'Ibrahim', '1999-02-13', 'Nkongsamba', 'M', 'Camerounaise', 'divorce(e)', 0, 'Douala, Cameroun', '+237 6794 70 80 31', 'ibrahim.atangana@gmail.com', 'ibrahim.atangana@admina-rh.cm', '2020-12-21', 'en_conge', NULL, '07585e13-f3aa-47c9-aea2-fac28dde7595'),
  ('68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1010', 'Ndi', 'Joséphine', '1974-07-03', 'Foumban', 'F', 'Camerounaise', 'veuf(ve)', 3, 'Bafoussam, Cameroun', '+237 6998 35 49 61', 'joséphine.ndi@gmail.com', 'joséphine.ndi@admina-rh.cm', '2025-04-15', 'actif', NULL, 'eff54922-b5c9-4f85-b803-73fd087bb0ec'),
  ('bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1011', 'Tchouankeu', 'Karl', '1985-04-03', 'Yaoundé', 'M', 'Camerounaise', 'divorce(e)', 4, 'Douala, Cameroun', '+237 6718 53 12 85', 'karl.tchouankeu@gmail.com', 'karl.tchouankeu@admina-rh.cm', '2024-03-18', 'actif', NULL, '430514dc-47e9-4063-a40f-3758c1f8b272'),
  ('0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1012', 'Ngassam', 'Léontine', '1965-04-28', 'Yaoundé', 'F', 'Camerounaise', 'veuf(ve)', 1, 'Bafoussam, Cameroun', '+237 6917 39 18 14', 'léontine.ngassam@gmail.com', 'léontine.ngassam@admina-rh.cm', '2021-09-15', 'actif', NULL, 'aee9ebf0-b200-47c5-8b78-53017af9faa8'),
  ('3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1013', 'Nsame', 'Maurice', '1977-06-29', 'Kumba', 'M', 'Camerounaise', 'veuf(ve)', 1, 'Yaoundé, Cameroun', '+237 6779 26 83 83', 'maurice.nsame@gmail.com', 'maurice.nsame@admina-rh.cm', '2023-04-21', 'actif', NULL, '33172891-3a55-40a2-8c3a-388593198e43'),
  ('c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1014', 'Moukouri', 'Nathalie', '1973-07-17', 'Yaoundé', 'F', 'Camerounaise', 'divorce(e)', 3, 'Douala, Cameroun', '+237 6965 55 64 62', 'nathalie.moukouri@gmail.com', 'nathalie.moukouri@admina-rh.cm', '2023-03-28', 'en_formation', NULL, '74ee3fb7-be78-4423-802e-7cc2289d5bfe'),
  ('234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1015', 'Zang', 'Olivier', '1995-03-17', 'Kumba', 'M', 'Camerounaise', 'celibataire', 0, 'Bafoussam, Cameroun', '+237 6717 61 53 23', 'olivier.zang@gmail.com', 'olivier.zang@admina-rh.cm', '2020-10-15', 'actif', NULL, 'b9385eb7-afdc-44c6-98c7-0f613884c6f2'),
  ('0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1016', 'Eyon', 'Patricia', '1985-02-15', 'Bafoussam', 'F', 'Camerounaise', 'marie(e)', 4, 'Yaoundé, Cameroun', '+237 6745 69 41 19', 'patricia.eyon@gmail.com', 'patricia.eyon@admina-rh.cm', '2022-12-21', 'en_conge', NULL, '4ca33199-e984-4fe5-b1cb-d1b6f3a1dc86'),
  ('07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1017', 'Nkoum', 'Quentin', '1967-04-09', 'Kumba', 'M', 'Camerounaise', 'celibataire', 0, 'Bafoussam, Cameroun', '+237 6721 40 31 62', 'quentin.nkoum@gmail.com', 'quentin.nkoum@admina-rh.cm', '2023-06-13', 'actif', NULL, '0128c069-0f86-41e8-bee0-146dbdff76fe'),
  ('7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1018', 'Nkoulou Mbarga', 'Rosalie', '1967-08-19', 'Bafoussam', 'F', 'Camerounaise', 'marie(e)', 3, 'Yaoundé, Cameroun', '+237 6759 43 68 46', 'rosalie.nkoulou_mbarga@gmail.com', 'rosalie.nkoulou_mbarga@admina-rh.cm', '2022-09-29', 'en_formation', NULL, '8e9f8477-315f-4aee-9263-e61491abee4b'),
  ('66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1019', 'Biya''a', 'Sylvain', '1997-03-24', 'Dschang', 'M', 'Camerounaise', 'veuf(ve)', 5, 'Douala, Cameroun', '+237 6747 37 17 84', 'sylvain.biyaa@gmail.com', 'sylvain.biyaa@admina-rh.cm', '2024-01-30', 'actif', NULL, '3158ea61-9bde-494b-bc18-7b8396ad486f'),
  ('c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1020', 'Ngwe', 'Thérèse', '1967-04-02', 'Ébolowa', 'F', 'Camerounaise', 'marie(e)', 0, 'Yaoundé, Cameroun', '+237 6977 30 17 75', 'thérèse.ngwe@gmail.com', 'thérèse.ngwe@admina-rh.cm', '2018-11-25', 'actif', NULL, '66734399-878a-4c45-9c52-e99d66294442');


-- ============================================================
-- SECTION 4: POSTES (15)
-- ============================================================

INSERT INTO public.postes (id, tenant_id, titre, code, classification, salaire_min, salaire_max, description, est_actif) VALUES
  ('879d57a9-57c9-4dba-8e73-ecc3910a2484', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Directeur Général', 'POSTE-100', 'A2', 155920, 829860, 'Poste de directeur général au sein de l''organisation.', TRUE),
  ('9fbf2337-013f-4a6b-993b-3d9a6dab3772', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Service RH', 'POSTE-101', 'A2', 243310, 716700, 'Poste de chef de service rh au sein de l''organisation.', TRUE),
  ('315ab39d-1fcf-41e8-9740-df402869c84c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Comptable Senior', 'POSTE-102', 'A1', 249090, 906130, 'Poste de comptable senior au sein de l''organisation.', TRUE),
  ('db1a69b3-70c9-4e91-8024-effbf387f295', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Développeur Full Stack', 'POSTE-103', 'D3', 162980, 652570, 'Poste de développeur full stack au sein de l''organisation.', TRUE),
  ('10dfd31b-b55b-4859-8eb1-528f61f0f13f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent Administratif', 'POSTE-104', 'B2', 285870, 609300, 'Poste de agent administratif au sein de l''organisation.', TRUE),
  ('0e80bd7a-ae9b-49c5-8ec8-161f7d30e7f1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Gestionnaire de Paie', 'POSTE-105', 'C1', 284720, 585000, 'Poste de gestionnaire de paie au sein de l''organisation.', TRUE),
  ('a607228e-2601-4ba7-84cd-d98ddd9eb480', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chargé de Recrutement', 'POSTE-106', 'C1', 327500, 514740, 'Poste de chargé de recrutement au sein de l''organisation.', TRUE),
  ('faa711cf-2219-4351-bb98-9900f0ff046e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Responsable Logistique', 'POSTE-107', 'A2', 359720, 741260, 'Poste de responsable logistique au sein de l''organisation.', TRUE),
  ('181352c0-7d60-4c8b-97cb-e5985586aac5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Contrôleur de Gestion', 'POSTE-108', 'A2', 124880, 655430, 'Poste de contrôleur de gestion au sein de l''organisation.', TRUE),
  ('90d9ad08-d3a1-4cfd-87d1-92a9ac2986f0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Assistante de Direction', 'POSTE-109', 'B2', 158410, 772160, 'Poste de assistante de direction au sein de l''organisation.', TRUE),
  ('d2c54301-5748-4403-92ad-652566f1d7ab', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Technicien Maintenance', 'POSTE-110', 'B1', 385230, 713310, 'Poste de technicien maintenance au sein de l''organisation.', TRUE),
  ('78fe3bc8-383e-4523-b5d4-37e6fd451581', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Projet IT', 'POSTE-111', 'B2', 302980, 425110, 'Poste de chef de projet it au sein de l''organisation.', TRUE),
  ('d1d0979d-2d57-4f78-ac32-e35258aa5f82', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Analyste Programmateur', 'POSTE-112', 'B1', 313740, 662570, 'Poste de analyste programmateur au sein de l''organisation.', TRUE),
  ('3e9294e5-9110-4416-8e6e-1f8ec76e3825', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent de Sécurité', 'POSTE-113', 'C1', 349730, 969340, 'Poste de agent de sécurité au sein de l''organisation.', TRUE),
  ('8c58dc14-8201-4b66-b1b8-7a69084b1b5d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Conducteur', 'POSTE-114', 'D3', 397320, 455520, 'Poste de conducteur au sein de l''organisation.', TRUE);


-- ============================================================
-- SECTION 5: D23 - STRUCTURES (10)
-- ============================================================

INSERT INTO public.d23_structures (id, tenant_id, parent_id, nom, code, type_structure, statut, effectif_prevu, niveau_hierarchique, description, date_creation, date_dissolution, est_actif, localisation, nombre_postes, departement_rattachement) VALUES
  ('6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'Direction Générale', 'direction_générale', 'service', 'actif', 11, 5, 'Budget annuel: 12746290 FCFA', '2020-08-07', NULL, TRUE, 'Douala', 2, 'Administration et Gestion des Carrieres'),
  ('95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Direction Administrative', 'direction_administrative', 'service', 'actif', 24, 4, 'Budget annuel: 47562990 FCFA', '2021-06-24', NULL, TRUE, 'Yaoundé', 2, 'Administration et Gestion des Carrieres'),
  ('8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Service RH', 'service_rh', 'direction', 'actif', 43, 7, 'Budget annuel: 23567700 FCFA', '2020-03-31', NULL, TRUE, 'Douala', 2, 'Administration et Gestion des Carrieres'),
  ('7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Service Comptabilité', 'service_comptabilité', 'departement', 'actif', 13, 8, 'Budget annuel: 42022650 FCFA', '2023-12-16', NULL, TRUE, 'Yaoundé', 3, 'Administration et Gestion des Carrieres'),
  ('a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Département Informatique', 'département_informatique', 'direction', 'actif', 7, 3, 'Budget annuel: 41613940 FCFA', '2020-03-14', NULL, TRUE, 'Yaoundé', 3, 'Administration et Gestion des Carrieres'),
  ('70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Pôle Logistique', 'pôle_logistique', 'equipe', 'actif', 30, 3, 'Budget annuel: 7807090 FCFA', '2021-09-23', NULL, TRUE, 'Yaoundé', 1, 'Administration et Gestion des Carrieres'),
  ('fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Service Commercial', 'service_commercial', 'service', 'actif', 18, 2, 'Budget annuel: 28734970 FCFA', '2023-02-20', NULL, TRUE, 'Yaoundé', 3, 'Administration et Gestion des Carrieres'),
  ('a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Département Technique', 'département_technique', 'departement', 'actif', 13, 3, 'Budget annuel: 32668610 FCFA', '2020-02-20', NULL, TRUE, 'Douala', 3, 'Administration et Gestion des Carrieres'),
  ('b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Équipe Qualité', 'équipe_qualité', 'service', 'en_reorganisation', 45, 4, 'Budget annuel: 22905030 FCFA', '2020-11-22', NULL, TRUE, 'Douala', 2, 'Administration et Gestion des Carrieres'),
  ('fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Service Juridique', 'service_juridique', 'direction', 'en_reorganisation', 17, 4, 'Budget annuel: 35890430 FCFA', '2021-12-17', NULL, TRUE, 'Yaoundé', 1, 'Administration et Gestion des Carrieres');


-- ============================================================
-- SECTION 6: D23 - ENTITES (8)
-- ============================================================

INSERT INTO public.d23_entites_organisationnelles (id, tenant_id, code, nom, type_entite, statut, effectif_courant, structure_id, date_creation) VALUES
  ('3d5a3000-e2d4-4b63-8927-ed8abbd94e38', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-DG', 'Direction Générale', 'direction', 'actif', 4, '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '2023-09-13'),
  ('870523c6-3f32-44a6-be0d-d3883a69a9cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-DA', 'Direction Administrative', 'direction', 'actif', 28, '95877ee1-8af8-4395-a284-fce5f3bba2bb', '2021-11-03'),
  ('b708ae29-5a82-4240-8c28-3bb95596ed11', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-RH', 'Service des Ressources Humaines', 'service', 'actif', 7, '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '2024-05-02'),
  ('aed026b9-222c-4bfb-a283-168ea18ecfa1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-CPT', 'Service Comptabilité', 'service', 'actif', 25, '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '2023-08-06'),
  ('181080e8-e034-4610-9e4d-60ce2a9a7aa8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-INFO', 'Département Informatique', 'departement', 'actif', 37, 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '2021-11-09'),
  ('6829331d-d636-4cd8-bf19-363c6b21b323', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-LOG', 'Pôle Logistique', 'pole', 'actif', 10, '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '2021-06-18'),
  ('0beacb5e-7734-4b09-ac04-6b3bccda17c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-COM', 'Service Commercial', 'service', 'actif', 40, 'fc560397-f042-4cea-888a-883660af34b9', '2021-06-27'),
  ('15105b3c-45e8-4d5b-9f81-102ea3a0ddb1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ENT-TECH', 'Département Technique', 'departement', 'actif', 9, 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '2023-05-06');


-- ============================================================
-- SECTION 7: D23 - NOMENCLATURES (12)
-- ============================================================

INSERT INTO public.d23_nomenclatures (id, tenant_id, code, titre, classification, famille_metier, niveau_hierarchique, salaire_min, salaire_max, statut) VALUES
  ('68c5938f-ec92-4d53-b2b0-e27e033e49b4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DIR-GEN', 'Directeur Général', 'A1', 'Direction', 1, 263920, 1024960, 'actif'),
  ('b2656940-b431-41bd-9ca9-c85e842e1fbd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CHEF-SRV', 'Chef de Service', 'B1', 'Encadrement', 2, 264400, 1571310, 'actif'),
  ('ed7f3eb5-e28e-4f5d-be8f-e6a53c4d32ba', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CPT-SR', 'Comptable Senior', 'B2', 'Administration', 2, 250980, 1509190, 'actif'),
  ('e65655e3-9860-4c5f-abb9-627037afe137', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DEV-FS', 'Développeur Full Stack', 'C1', 'Informatique', 3, 216770, 393080, 'obsolete'),
  ('ec1eeb0f-e175-463f-a433-12018b007d3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'AG-ADM', 'Agent Administratif', 'D1', 'Administration', 3, 150440, 1390350, 'actif'),
  ('8b4f6c56-edc9-4b00-8685-3b7e1913a2a0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'GEST-PAIE', 'Gestionnaire de Paie', 'B2', 'RH', 2, 245480, 1204500, 'actif'),
  ('418ff39c-b479-43c4-b2a6-9b80ef6759f8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CHG-REC', 'Chargé de Recrutement', 'C1', 'RH', 3, 398740, 1693010, 'actif'),
  ('2503d136-b0dc-422b-8487-a448c25e7b25', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'RESP-LOG', 'Responsable Logistique', 'B1', 'Logistique', 2, 313360, 958330, 'actif'),
  ('74f185af-c474-4ebd-8cdb-33bd49096b01', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CTR-GEST', 'Contrôleur de Gestion', 'B2', 'Finance', 2, 338680, 929820, 'actif'),
  ('a98dc3cc-b025-43ad-9597-9f154f860b95', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'AST-DIR', 'Assistante de Direction', 'C2', 'Administration', 3, 324820, 1156460, 'actif'),
  ('de503cd6-d65b-484f-ac05-ba352ba9dd5e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'TECH-MAINT', 'Technicien Maintenance', 'D2', 'Technique', 3, 255490, 1762150, 'actif'),
  ('01d9fb72-d210-47c6-8ed8-285e55d0f98d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CP-IT', 'Chef de Projet IT', 'B1', 'Informatique', 2, 295340, 566940, 'actif');


-- ============================================================
-- SECTION 8: D23 - AFFECTATIONS (20)
-- ============================================================

INSERT INTO public.d23_affectations (id, employe_id, structure_id, tenant_id, fonction, type_affectation, date_debut, date_fin, statut) VALUES
  ('e656fbca-e434-44ec-9c2a-c7adb4679391', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Directeur Général', 'detachement', '2023-09-23', '2025-12-21', 'actif'),
  ('75a8a23b-9585-4a5e-be4a-ee732371207b', '65f95479-3f97-4e74-91f7-761f41257843', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Service RH', 'integration', '2023-03-11', NULL, 'actif'),
  ('8afec5bf-6c68-496c-8107-e5b7a049e4c9', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Comptable Senior', 'titulaire', '2021-08-10', NULL, 'actif'),
  ('7d1db8d8-3ccc-46fc-b884-212b3c717d62', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Développeur Full Stack', 'detachement', '2022-06-23', NULL, 'actif'),
  ('41824191-b367-4466-a3cb-39d01fc2209f', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent Administratif', 'integration', '2022-08-27', '2025-08-13', 'actif'),
  ('30c2b92d-6069-42df-bdd5-8deef7e32a92', 'ebd9079a-f426-4c86-9537-0d839b042e93', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Gestionnaire de Paie', 'titulaire', '2022-11-21', NULL, 'actif'),
  ('1eaf19e0-6870-4548-be96-1ed9c5be3708', '1fd4257c-0dd3-4185-a3af-808e4698d422', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chargé de Recrutement', 'titulaire', '2024-08-03', '2025-08-30', 'actif'),
  ('51dfc1d6-2755-46e7-8a3d-924e67f719a3', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Responsable Logistique', 'titulaire', '2024-07-09', NULL, 'actif'),
  ('d4dc86b7-f5a2-4179-b9b1-eed138c1df8d', '95575fac-569c-4ce8-baec-a455a421537d', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Contrôleur de Gestion', 'titulaire', '2021-05-16', '2025-12-04', 'actif'),
  ('ce44882d-7935-4257-80b4-4eaa71ab2041', '68d2c030-00f1-4b7a-a310-fd67ed78af78', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Assistante de Direction', 'detachement', '2022-04-28', '2025-11-25', 'actif'),
  ('09281372-f22e-4702-8a47-e182094e2dcb', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Technicien Maintenance', 'detachement', '2022-10-09', NULL, 'actif'),
  ('6962ffb1-ced1-40a3-8b55-bad4dc1ce1bb', '0431f18d-1482-40bc-bd49-a749ffa68094', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Projet IT', 'titulaire', '2025-01-02', '2025-07-28', 'en_attente'),
  ('ec449d23-de9c-47e2-856f-83edf7e8c909', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Analyste Programmateur', 'titulaire', '2020-12-26', '2025-12-26', 'en_attente'),
  ('9be16552-e9ee-4fe0-91eb-cb77a385af11', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent de Sécurité', 'titulaire', '2023-02-15', NULL, 'actif'),
  ('0ecac09b-2d6a-440f-8c93-74e0f7ed8cd9', '234c72a5-919c-4d02-99c8-9702006db7cd', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Conducteur', 'detachement', '2020-09-30', '2025-12-18', 'actif'),
  ('260ffcab-4786-42eb-b03d-a93c9047d457', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Directeur Général', 'detachement', '2023-06-08', '2025-11-07', 'en_attente'),
  ('f5e8e2df-cfc0-4f0d-b689-d919af100072', '07f73f09-8fdf-4b80-b108-c86549a98028', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Service RH', 'integration', '2022-07-02', '2025-10-30', 'en_attente'),
  ('29a49bdc-8431-4d4e-8a66-ebd8f29682ac', '7f16aac0-e821-4e13-9f8e-d59940cda288', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Comptable Senior', 'titulaire', '2024-03-19', NULL, 'actif'),
  ('8552de0f-db2c-41bb-8bd4-797edd6361d5', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Développeur Full Stack', 'integration', '2022-09-19', NULL, 'actif'),
  ('f1ad0f9c-fbe7-4331-bcb7-6eed5a593df6', 'c384e532-75ff-4c20-b835-e312a56b2acc', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent Administratif', 'detachement', '2020-06-07', '2025-08-30', 'actif');


-- ============================================================
-- SECTION 9: D23 - HISTORIQUE STRUCTURES (15)
-- ============================================================

INSERT INTO public.d23_historique_structures (id, structure_id, tenant_id, type_changement, initiateur, description, date_changement) VALUES
  ('634200d7-c47d-49bd-a584-3ae3dd949a61', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'rattachement', 'DRH', 'Changement applique le 2024-07-07', '2023-03-24'),
  ('ea43a6f9-a239-4299-9826-bc388acf4cb6', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'modification_nom', 'Admin', 'Changement applique le 2023-08-25', '2024-01-28'),
  ('8370b997-f020-4388-9938-1cf4e72685ab', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reorganisation', 'Admin', 'Changement applique le 2024-12-24', '2023-08-08'),
  ('2aca0f9e-3d52-45f2-8885-5a4356727757', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'creation', 'DRH', 'Changement applique le 2024-02-22', '2023-12-05'),
  ('a96b8e95-2c55-43f8-83fa-5fecb2b7d038', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'scission', 'DRH', 'Changement applique le 2024-03-01', '2023-03-05'),
  ('380c22e6-14fb-4042-bf69-8dd8778faef6', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'modification_nom', 'DRH', 'Changement applique le 2024-02-03', '2025-02-27'),
  ('3826a83f-c0d8-4703-b116-cd03c56dadda', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'scission', 'Direction Générale', 'Changement applique le 2023-01-21', '2025-05-27'),
  ('5852d29c-ab93-4db5-ba43-d4640dc74640', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'scission', 'DRH', 'Changement applique le 2024-05-03', '2023-01-07'),
  ('bbd22240-e2da-410b-8523-1ed4a93cc1b8', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'rattachement', 'DRH', 'Changement applique le 2025-02-10', '2024-02-04'),
  ('c4b23c5e-8f7a-4951-8d49-998c7f43b173', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fusion', 'Direction Générale', 'Changement applique le 2025-02-04', '2025-01-22'),
  ('c59718b1-70a1-45a9-b933-e434873e179a', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'scission', 'Direction Générale', 'Changement applique le 2023-08-14', '2024-05-14'),
  ('908126b6-c0db-43e8-b930-47b4cfd7293e', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'modification_nom', 'DRH', 'Changement applique le 2024-03-22', '2024-05-12'),
  ('87a173b2-282a-4d65-b09c-ad6a4f946636', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'creation', 'DRH', 'Changement applique le 2023-12-11', '2024-11-15'),
  ('36aaa020-514f-46f1-9bfa-cab8465136eb', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reorganisation', 'DRH', 'Changement applique le 2025-01-11', '2023-06-19'),
  ('5b2472ab-dbbe-45b6-9d4f-8a39da8ff598', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fusion', 'Admin', 'Changement applique le 2024-09-29', '2024-06-30');


-- ============================================================
-- SECTION 10: D23 - POSTES BUDGETAIRES (15)
-- ============================================================

INSERT INTO public.d23_postes_budgetaires (id, structure_id, tenant_id, titre_poste, code_poste, effectif_autorise, effectif_reel, budget_annuel, statut, exercice) VALUES
  ('79b3bbb1-20df-4644-ac65-ddf4308df4fa', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Directeur Général', 'PB-100', 1, 2, 1441290, 'en_recrutement', 2025),
  ('a6778470-dac9-4568-9129-1a90fcb2bf36', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Service RH', 'PB-101', 1, 1, 1098870, 'pourvu', 2025),
  ('04eff83f-c197-49bc-8810-1d94b482252b', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Comptable Senior', 'PB-102', 4, 1, 305450, 'pourvu', 2025),
  ('35152953-d65f-4e57-908f-719af16f35cf', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Développeur Full Stack', 'PB-103', 4, 2, 643880, 'vacant', 2025),
  ('d6491a2f-0ddb-4dfc-887e-a14810cfd8e0', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent Administratif', 'PB-104', 3, 2, 995080, 'pourvu', 2025),
  ('1568f122-5cf4-46be-b436-32602a6d0b0f', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Gestionnaire de Paie', 'PB-105', 4, 2, 371770, 'vacant', 2025),
  ('0f8af49f-c495-46d3-8c10-bd520a86a2d9', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chargé de Recrutement', 'PB-106', 1, 3, 1331240, 'pourvu', 2025),
  ('44646789-f7cf-4387-a269-a349902d2bbc', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Responsable Logistique', 'PB-107', 3, 1, 343900, 'pourvu', 2025),
  ('cbf3450c-78b0-4194-abd5-c98719949182', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Contrôleur de Gestion', 'PB-108', 1, 1, 618090, 'pourvu', 2025),
  ('7ad9b79d-41a7-4951-b3e3-74303fdc3fcf', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Assistante de Direction', 'PB-109', 5, 1, 700260, 'pourvu', 2025),
  ('f599012e-616f-479a-a722-a778cdec1692', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Technicien Maintenance', 'PB-110', 4, 3, 439890, 'en_recrutement', 2025),
  ('2e0fb377-e71b-4a9f-8ab3-c66d4b8cd992', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Chef de Projet IT', 'PB-111', 2, 2, 737380, 'pourvu', 2025),
  ('c05a4aab-eefe-45db-8a35-92078750af09', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Analyste Programmateur', 'PB-112', 2, 3, 1473490, 'pourvu', 2025),
  ('765ae71a-e7cb-43f8-af7a-142732e71943', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Agent de Sécurité', 'PB-113', 2, 2, 426700, 'en_recrutement', 2025),
  ('6b4b9ffc-f73c-49bb-a194-a7057102509f', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Conducteur', 'PB-114', 1, 2, 1407530, 'vacant', 2025);


-- ============================================================
-- SECTION 11: D02 - CONTRATS (20)
-- ============================================================

INSERT INTO public.d02_contrats (id, employe_id, poste_id, tenant_id, type_contrat, date_debut, date_fin, duree_mois, salaire_base, periodicite_paie, temps_travail, statut, lieu_travail, observations) VALUES
  ('1f68b09a-af02-4123-814c-e2dcc8af50df', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '879d57a9-57c9-4dba-8e73-ecc3910a2484', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2020-03-23', NULL, NULL, 981840, 'mensuel', 'temps_plein', 'actif', 'Direction Générale', 'Contrat CDI - Directeur Général'),
  ('3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '65f95479-3f97-4e74-91f7-761f41257843', '9fbf2337-013f-4a6b-993b-3d9a6dab3772', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2024-09-25', NULL, NULL, 782460, 'mensuel', 'temps_plein', 'actif', 'Service RH', 'Contrat CDI - Chef de Service RH'),
  ('ce563240-0a54-427e-90d1-a172b9edfcc6', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '315ab39d-1fcf-41e8-9740-df402869c84c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2022-10-21', NULL, NULL, 1267250, 'mensuel', 'temps_plein', 'actif', 'Service RH', 'Contrat CDI - Comptable Senior'),
  ('b85a8eaa-3b53-4ede-984f-ccd57083c961', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'db1a69b3-70c9-4e91-8024-effbf387f295', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2022-09-17', NULL, NULL, 176530, 'hebdomadaire', 'temps_plein', 'actif', 'Service RH', 'Contrat CDI - Développeur Full Stack'),
  ('0d734884-8104-428c-b4b8-d6f017a0467c', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '10dfd31b-b55b-4859-8eb1-528f61f0f13f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDD', '2025-02-16', '2027-12-30', 32, 909560, 'hebdomadaire', 'temps_plein', 'actif', 'Service RH', 'Contrat CDD - Agent Administratif'),
  ('d19d44fd-0052-4688-bcae-7990ec980414', 'ebd9079a-f426-4c86-9537-0d839b042e93', '0e80bd7a-ae9b-49c5-8ec8-161f7d30e7f1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDD', '2023-11-08', '2027-04-28', 14, 519380, 'hebdomadaire', 'temps_partiel', 'termine', 'Service RH', 'Contrat CDD - Gestionnaire de Paie'),
  ('9df6a7b6-421d-4ddf-8a3e-fa92618a4511', '1fd4257c-0dd3-4185-a3af-808e4698d422', 'a607228e-2601-4ba7-84cd-d98ddd9eb480', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Stage', '2021-01-04', '2026-05-27', 33, 1392510, 'mensuel', 'temps_plein', 'actif', 'Service RH', 'Contrat Stage - Chargé de Recrutement'),
  ('c00593f6-cfaf-4b34-82e4-20ad9a927cc9', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'faa711cf-2219-4351-bb98-9900f0ff046e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Interim', '2020-09-25', '2027-08-08', 20, 1095400, 'hebdomadaire', 'temps_plein', 'actif', 'Direction Générale', 'Contrat Interim - Responsable Logistique'),
  ('8377827a-2216-45c6-bb87-e3d9362133f2', '95575fac-569c-4ce8-baec-a455a421537d', '181352c0-7d60-4c8b-97cb-e5985586aac5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2021-08-24', NULL, NULL, 1186640, 'mensuel', 'temps_partiel', 'actif', 'Direction Générale', 'Contrat CDI - Contrôleur de Gestion'),
  ('5478a178-8606-4eb1-8897-2fa9f8c4b2ed', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '90d9ad08-d3a1-4cfd-87d1-92a9ac2986f0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2020-11-24', NULL, NULL, 894120, 'mensuel', 'temps_plein', 'suspendu', 'Service RH', 'Contrat CDI - Assistante de Direction'),
  ('1cd1da00-6658-4484-b12a-cb2c85d66006', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', 'd2c54301-5748-4403-92ad-652566f1d7ab', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2018-02-11', NULL, NULL, 1315580, 'mensuel', 'temps_plein', 'actif', 'Direction Générale', 'Contrat CDI - Technicien Maintenance'),
  ('74c63929-7e77-47ed-a559-9953dff26fd5', '0431f18d-1482-40bc-bd49-a749ffa68094', '78fe3bc8-383e-4523-b5d4-37e6fd451581', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2023-06-25', NULL, NULL, 1002340, 'mensuel', 'temps_partiel', 'actif', 'Service RH', 'Contrat CDI - Chef de Projet IT'),
  ('a685e375-99d5-479b-8718-2844f517c4ac', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', 'd1d0979d-2d57-4f78-ac32-e35258aa5f82', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDD', '2018-03-12', '2025-10-04', 15, 1089890, 'mensuel', 'temps_partiel', 'actif', 'Direction Générale', 'Contrat CDD - Analyste Programmateur'),
  ('347dada1-f081-4c0c-9fa7-85ff63756074', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '3e9294e5-9110-4416-8e6e-1f8ec76e3825', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2024-07-10', NULL, NULL, 792160, 'mensuel', 'temps_partiel', 'en_negociation', 'Service RH', 'Contrat CDI - Agent de Sécurité'),
  ('90d5b3b7-7d2c-4b8a-82c7-7e7a6cac6ca4', '234c72a5-919c-4d02-99c8-9702006db7cd', '8c58dc14-8201-4b66-b1b8-7a69084b1b5d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDD', '2024-03-04', '2026-06-04', 17, 1042350, 'hebdomadaire', 'temps_plein', 'actif', 'Service RH', 'Contrat CDD - Conducteur'),
  ('64f4db72-9d56-4e21-9c81-fb6bf185d6f7', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '879d57a9-57c9-4dba-8e73-ecc3910a2484', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2020-08-02', NULL, NULL, 677230, 'mensuel', 'temps_plein', 'actif', 'Service RH', 'Contrat CDI - Directeur Général'),
  ('928913bd-d424-4e13-8898-8ba8939d2e11', '07f73f09-8fdf-4b80-b108-c86549a98028', '9fbf2337-013f-4a6b-993b-3d9a6dab3772', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDD', '2024-01-04', '2027-08-20', 28, 400720, 'mensuel', 'temps_plein', 'actif', 'Direction Générale', 'Contrat CDD - Chef de Service RH'),
  ('c6eb3b5a-ac69-4aac-b6d0-c493ea2a4a28', '7f16aac0-e821-4e13-9f8e-d59940cda288', '315ab39d-1fcf-41e8-9740-df402869c84c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2021-02-06', NULL, NULL, 1165440, 'mensuel', 'temps_plein', 'actif', 'Direction Générale', 'Contrat CDI - Comptable Senior'),
  ('2a62514b-9c2a-4a9d-94f1-fe7bf9b3853f', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', 'db1a69b3-70c9-4e91-8024-effbf387f295', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Stage', '2020-07-20', '2026-07-05', 11, 771270, 'mensuel', 'temps_plein', 'actif', 'Direction Générale', 'Contrat Stage - Développeur Full Stack'),
  ('2a1f54b1-0c42-47c4-9ca8-6b5846290250', 'c384e532-75ff-4c20-b835-e312a56b2acc', '10dfd31b-b55b-4859-8eb1-528f61f0f13f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CDI', '2018-07-06', NULL, NULL, 725270, 'mensuel', 'temps_plein', 'actif', 'Direction Générale', 'Contrat CDI - Agent Administratif');


-- ============================================================
-- SECTION 12: D02 - AVENANTS (12)
-- ============================================================

INSERT INTO public.d02_avenants (id, contrat_id, tenant_id, type_avenant, date_effet, description, statut, valide_par, reference) VALUES
  ('0fc10e64-ea76-4b88-bca1-979c452eedab', '1f68b09a-af02-4123-814c-e2dcc8af50df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'renouvellement', '2024-04-15', 'Mutation vers un nouveau service', 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-100'),
  ('0286a95e-9670-4fb5-952e-74c08fafe0fb', '3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'renouvellement', '2025-05-05', 'Renouvellement du contrat pour une duree additionnelle', 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-101'),
  ('877fe02b-3fa2-492f-893b-f7d3d5d38ac8', 'ce563240-0a54-427e-90d1-a172b9edfcc6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'passage_cdi', '2024-02-22', 'Promotion au grade superieur', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-102'),
  ('007a0d85-09cc-4310-b52e-abc2f6c64093', 'b85a8eaa-3b53-4ede-984f-ccd57083c961', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mutation', '2024-03-07', 'Renouvellement du contrat pour une duree additionnelle', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-103'),
  ('11617389-797c-4838-9740-d2e8c7bb5a45', '0d734884-8104-428c-b4b8-d6f017a0467c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mutation', '2025-08-13', 'Mutation vers un nouveau service', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-104'),
  ('6a85f052-33f6-4f36-9574-54e0e96ce94f', 'd19d44fd-0052-4688-bcae-7990ec980414', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'passage_cdi', '2025-07-30', 'Promotion au grade superieur', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-105'),
  ('593ee905-20e0-4346-af6a-b5682dbacba7', '9df6a7b6-421d-4ddf-8a3e-fa92618a4511', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'passage_cdi', '2024-05-01', 'Revalorisation du salaire de base', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-106'),
  ('23be6447-7926-4f6d-95b6-88f3d19972d7', 'c00593f6-cfaf-4b34-82e4-20ad9a927cc9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'salaire', '2025-09-02', 'Revalorisation du salaire de base', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-107'),
  ('13f64638-7791-4b43-9d29-d7b974948385', '8377827a-2216-45c6-bb87-e3d9362133f2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'salaire', '2025-01-24', 'Renouvellement du contrat pour une duree additionnelle', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-108'),
  ('f50757e3-c0b1-460b-b59d-3c1c121497c3', '5478a178-8606-4eb1-8897-2fa9f8c4b2ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'promotion', '2025-08-25', 'Renouvellement du contrat pour une duree additionnelle', 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-109'),
  ('7bdac780-d03a-4d60-a7fb-500cbc8768a4', '1cd1da00-6658-4484-b12a-cb2c85d66006', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'salaire', '2025-09-27', 'Mutation vers un nouveau service', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-110'),
  ('6fb7690c-7655-4ba5-b57c-6e9615c7cbc6', '74c63929-7e77-47ed-a559-9953dff26fd5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'passage_cdi', '2025-10-02', 'Passage de CDD a CDI apres periode d''essai', 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'AV-111');


-- ============================================================
-- SECTION 13: D02 - DOCUMENTS EMPLOYE (25)
-- ============================================================

INSERT INTO public.d02_documents_employe (id, employe_id, tenant_id, type_document, description, date_emission, date_expiration, statut, fichier_url, est_numerique, date_verification) VALUES
  ('e1422e4e-3343-4c57-a5db-0b114030e6b3', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'passeport', 'Casier Judiciaire de Jean-Pierre Nkoulou', '2021-05-06', NULL, 'actif', '/documents/2c3c63de/casier_judiciaire.pdf', 'oui', '2025-07-29'),
  ('456edc9b-3484-49bb-8631-e4642fac3e10', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Certificat Medical de Marie-Claire Tchinda', '2021-08-19', NULL, 'expire', '/documents/65f95479/certificat_travail.pdf', 'non', '2025-02-06'),
  ('b35c4740-5a1e-450a-89d8-89cce690b352', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'diplome', 'Certificat Travail de Alain Nganou', '2024-06-01', '2029-03-22', 'actif', '/documents/a2abc60b/permis_conduire.pdf', 'oui', '2025-10-06'),
  ('6f83e6e8-d4d2-41d2-acf8-901b41311122', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'diplome', 'Casier Judiciaire de Béatrice Eyenga', '2025-02-03', NULL, 'actif', '/documents/6b4be2db/passeport.pdf', 'oui', '2025-03-26'),
  ('f8f6ec4f-70de-4815-acf7-840826b71d25', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_travail', 'Certificat Travail de Emmanuel Fotso', '2022-06-18', NULL, 'expire', '/documents/3f20159c/permis_conduire.pdf', 'non', '2025-09-14'),
  ('3dccd8bd-da13-499f-a99f-dd0a113a4057', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Certificat Medical de Florence Kamga', '2020-06-13', '2030-11-26', 'en_attente', '/documents/ebd9079a/attestation_employeur.pdf', 'non', '2025-01-14'),
  ('f606e89a-3eb4-4181-a406-89addccf6076', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'passeport', 'Diplome de Grégoire Ngo Mbeck', '2025-05-23', '2030-09-28', 'actif', '/documents/1fd4257c/certificat_travail.pdf', 'oui', '2025-03-31'),
  ('1071b76e-032c-44c6-b509-54dc54870f1a', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Certificat Medical de Hélène Mbarga', '2025-02-19', NULL, 'en_attente', '/documents/cf0addc5/certificat_medical.pdf', 'oui', '2025-08-29'),
  ('f98c6d66-46fe-4f41-b24b-990c37844e4c', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'attestation_employeur', 'Permis Conduire de Ibrahim Atangana', '2021-11-13', NULL, 'actif', '/documents/95575fac/casier_judiciaire.pdf', 'non', '2025-07-30'),
  ('6fd43f8f-5c03-489b-8320-05f0f172fbd0', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Certificat Travail de Joséphine Ndi', '2023-09-18', '2030-06-24', 'actif', '/documents/68d2c030/certificat_medical.pdf', 'oui', '2025-06-11'),
  ('fcc14293-cc2d-4979-a535-d268503b068f', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_travail', 'Attestation Employeur de Karl Tchouankeu', '2020-08-25', '2028-03-07', 'actif', '/documents/bd84bc97/certificat_medical.pdf', 'non', '2025-01-28'),
  ('aede1081-b51d-47cf-9b43-e1af3d13701e', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'diplome', 'Attestation Employeur de Léontine Ngassam', '2023-06-29', '2029-06-03', 'en_attente', '/documents/0431f18d/carte_identite.pdf', 'oui', '2025-05-17'),
  ('8aefc20d-49f2-4028-80cd-107be59a29c1', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'casier_judiciaire', 'Certificat Travail de Maurice Nsame', '2022-06-16', '2028-08-19', 'actif', '/documents/3bb3fb28/carte_identite.pdf', 'oui', '2025-12-30'),
  ('19be7a28-5fea-405c-823d-6292aa1ec6ce', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'casier_judiciaire', 'Certificat Travail de Nathalie Moukouri', '2023-02-02', NULL, 'en_attente', '/documents/c8a51ea6/passeport.pdf', 'oui', '2025-02-28'),
  ('16543f03-19e5-4842-9782-d56adf8fb36f', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Passeport de Olivier Zang', '2023-08-19', '2028-09-16', 'expire', '/documents/234c72a5/certificat_travail.pdf', 'non', '2025-09-05'),
  ('4134f7d2-6fde-4d33-9ce0-e4258482622d', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Diplome de Patricia Eyon', '2022-07-24', '2028-01-25', 'actif', '/documents/0571152c/casier_judiciaire.pdf', 'oui', '2025-05-22'),
  ('3785c162-6a91-47a8-acfd-ebc08ca50cdd', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permis_conduire', 'Attestation Employeur de Quentin Nkoum', '2025-03-28', '2027-06-01', 'actif', '/documents/07f73f09/certificat_travail.pdf', 'non', '2025-10-28'),
  ('fa611f7f-4a0a-42f9-bc78-cfd38920309b', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_medical', 'Casier Judiciaire de Rosalie Nkoulou Mbarga', '2022-07-03', '2027-11-07', 'expire', '/documents/7f16aac0/permis_conduire.pdf', 'non', '2025-06-14'),
  ('9d713eb0-1585-414c-a109-464c88eda022', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'diplome', 'Diplome de Sylvain Biya''a', '2023-03-17', NULL, 'en_attente', '/documents/66b90bf6/carte_identite.pdf', 'non', '2025-08-31'),
  ('66b21d73-dedb-4709-9fec-4afb9001453a', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permis_conduire', 'Permis Conduire de Thérèse Ngwe', '2023-09-21', '2029-07-28', 'actif', '/documents/c384e532/certificat_medical.pdf', 'oui', '2025-03-06'),
  ('d4b5f0e1-21cb-4318-b1a3-e0bf9e49af4c', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'attestation_employeur', 'Passeport de Jean-Pierre Nkoulou', '2024-11-25', '2026-06-23', 'en_attente', '/documents/2c3c63de/carte_identite.pdf', 'oui', '2025-07-29'),
  ('def60939-560a-4f6c-8912-2578bc4eb400', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'casier_judiciaire', 'Passeport de Marie-Claire Tchinda', '2022-08-19', '2027-05-27', 'expire', '/documents/65f95479/permis_conduire.pdf', 'oui', '2025-06-18'),
  ('590fda76-f79e-4c3f-9cca-9010c3c775c1', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permis_conduire', 'Attestation Employeur de Alain Nganou', '2023-07-07', '2030-03-05', 'en_attente', '/documents/a2abc60b/carte_identite.pdf', 'oui', '2025-05-01'),
  ('4eb51363-dfcc-4536-935c-ea8617bfccc0', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_travail', 'Diplome de Béatrice Eyenga', '2024-03-09', NULL, 'actif', '/documents/6b4be2db/passeport.pdf', 'non', '2025-03-27'),
  ('cf084053-f15d-4c3e-8e40-46a177d99217', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'certificat_travail', 'Carte Identite de Emmanuel Fotso', '2020-04-04', NULL, 'actif', '/documents/3f20159c/certificat_travail.pdf', 'non', '2025-07-11');


-- ============================================================
-- SECTION 14: D02 - DONNEES BANCAIRES (20)
-- ============================================================

INSERT INTO public.d02_donnees_bancaires (id, employe_id, tenant_id, nom_banque, rib, type_compte, est_actif, date_ouverture, date_maj) VALUES
  ('c77dc105-5394-4311-ab85-66e176db303b', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ECOBANK', 'CM079768296735', 'principal', TRUE, '2023-03-05', '2025-12-16'),
  ('4159e4a0-f5f3-4a7f-ae54-86277e328c4c', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'STANDARD CHARTERED', 'CM032204910695', 'principal', TRUE, '2023-06-02', '2025-07-15'),
  ('e6c303f0-3cdc-437b-ad16-65be1243a8e9', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'SBA', 'CM275458865527', 'secondaire', TRUE, '2020-10-20', '2025-04-29'),
  ('36a29815-77b8-4d7a-b028-270903dfd277', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ECOBANK', 'CM271220366517', 'principal', TRUE, '2023-09-27', '2025-01-05'),
  ('763a6a82-1426-433b-8ae5-1803d5455f44', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'STANDARD CHARTERED', 'CM152525370668', 'secondaire', TRUE, '2023-01-24', '2025-03-22'),
  ('3f77838b-336f-4c68-9210-98a05932d3b0', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'SGBC', 'CM161304396389', 'secondaire', TRUE, '2021-09-04', '2025-11-24'),
  ('a6186efb-6560-43c7-b4c4-ba5b745299e4', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ECOBANK', 'CM271203705842', 'principal', TRUE, '2021-02-11', '2025-07-16'),
  ('81d60c96-9557-42f8-8dd4-b22a945af2db', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'STANDARD CHARTERED', 'CM140522843390', 'principal', TRUE, '2023-03-17', '2025-07-03'),
  ('a069ecb7-9ca2-434f-9636-adcc2e3c98d5', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'SBA', 'CM111268006448', 'secondaire', TRUE, '2022-03-21', '2025-05-21'),
  ('212a4ec2-aa06-4169-a9f6-610943a2733e', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'SGBC', 'CM218476559573', 'secondaire', TRUE, '2024-03-06', '2025-09-12'),
  ('e6e2a26f-1bee-434d-a943-27087f604ca5', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'STANDARD CHARTERED', 'CM192592729598', 'principal', TRUE, '2021-03-24', '2025-11-22'),
  ('4fe9f4d1-d052-49c9-8414-dc0ec1e94cea', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'AFRILAND', 'CM296486808262', 'principal', TRUE, '2023-07-09', '2025-11-27'),
  ('0780999f-0fea-4aed-9ebc-b3f8ef1d3274', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'SGBC', 'CM173516598388', 'principal', TRUE, '2023-04-01', '2025-07-06'),
  ('c486e57b-dc5e-438d-850f-30700c2f6945', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'UBA', 'CM054217162716', 'secondaire', TRUE, '2022-04-30', '2025-03-31'),
  ('f426b214-8a7f-492a-b2d0-5628cd042838', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'AFRILAND', 'CM086392490846', 'principal', TRUE, '2022-12-23', '2025-09-14'),
  ('97c7dbb5-5257-4666-a1eb-9833b644d099', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'BICEC', 'CM052118547373', 'secondaire', TRUE, '2024-11-17', '2025-06-23'),
  ('3e545a73-4252-4721-9d5e-2a9ffadd4ec9', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'STANDARD CHARTERED', 'CM027503277481', 'principal', TRUE, '2024-10-27', '2025-12-13'),
  ('d9bfc80f-7bed-414d-8138-6cd23dd81fb1', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'UBA', 'CM265748427427', 'secondaire', TRUE, '2022-01-19', '2025-02-16'),
  ('ef4315a5-d5bb-4f6e-8e87-d23ee5de6b53', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'STANDARD CHARTERED', 'CM144419518557', 'secondaire', TRUE, '2020-09-10', '2025-08-21'),
  ('5a825431-8777-46ef-b6a6-552058900912', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'BICEC', 'CM288435386015', 'principal', TRUE, '2024-08-11', '2025-11-23');


-- ============================================================
-- SECTION 15: D02 - MUTUELLE PREVOYANCE (15)
-- ============================================================

INSERT INTO public.d02_mutuelle_prevoyance (id, employe_id, tenant_id, organisme, numero_police, type_couverture, statut, cotisation_mensuelle, plafond_couverture, date_adhesion, date_echeance, periodicite_cotisation) VALUES
  ('801b2c34-181d-45e8-ac41-06b2aa7193dc', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Mutuelle IPRES', 'POL-24201', 'retraite', 'actif', 35900, 26560, '2025-02-23', '2023-11-03', 'annuel'),
  ('e1b529d4-85f9-40f0-af12-84284e734e69', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CNSS', 'POL-94889', 'sante', 'resilie', 24800, 190190, '2024-04-16', '2022-08-27', 'mensuel'),
  ('482a7a6c-d7dc-4b2b-82bf-2700c8c1e6b2', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CNPS', 'POL-14877', 'prevoyance', 'resilie', 12610, 45480, '2023-04-26', '2026-12-23', 'annuel'),
  ('795ee891-be28-4035-8474-ae6378eff9e7', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CNSS', 'POL-60940', 'prevoyance', 'en_attente', 48940, 161610, '2024-05-08', '2025-04-17', 'annuel'),
  ('aa23d012-9a7d-41db-b1a9-d490d0bc0656', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Allianz', 'POL-30253', 'prevoyance', 'actif', 37070, 181390, '2024-04-15', '2023-07-27', 'mensuel'),
  ('74aa455f-8bc4-42b3-a93d-b04cf8008208', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Allianz', 'POL-58566', 'sante', 'resilie', 34140, 81900, '2024-01-13', '2022-07-23', 'annuel'),
  ('fc1053b2-2fb4-41e5-9f86-955f03c3c588', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Mutuelle IPRES', 'POL-81364', 'retraite', 'en_attente', 8970, 124370, '2023-07-20', '2023-01-24', 'mensuel'),
  ('9b00b652-7ba5-4ebe-9ea2-08c5ffb0176b', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'AXA Assurances', 'POL-22015', 'retraite', 'actif', 47050, 187640, '2025-05-07', '2022-02-13', 'mensuel'),
  ('6d83a684-52a7-42c5-9403-ac29fea545d5', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Mutuelle IPRES', 'POL-41925', 'sante', 'actif', 9500, 165280, '2023-03-01', '2025-04-15', 'mensuel'),
  ('4a882052-86b8-49e5-88a9-99184deb0f46', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CNSS', 'POL-53064', 'sante', 'actif', 23170, 57930, '2022-09-24', '2025-01-11', 'trimestriel'),
  ('606236f1-b73b-4ef8-96dc-152c2f74a3c2', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CNSS', 'POL-24408', 'retraite', 'actif', 13640, 23900, '2024-01-04', '2026-06-06', 'mensuel'),
  ('1fc9f20d-eb9d-450b-8a00-b06aa947ee56', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ACTIVA', 'POL-52437', 'sante', 'actif', 22390, 33740, '2022-09-17', '2026-02-28', 'trimestriel'),
  ('237fb57f-74a4-4687-a905-8835bb8a79af', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ACTIVA', 'POL-24896', 'retraite', 'actif', 36210, 137510, '2024-01-12', '2024-11-17', 'annuel'),
  ('cba8b3e0-7d19-43f4-9894-0b58f6157a78', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'CNPS', 'POL-69245', 'retraite', 'actif', 45310, 31370, '2024-12-03', '2023-09-10', 'trimestriel'),
  ('2829222a-18d5-47d1-b38b-c90db56a22cb', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Allianz', 'POL-14082', 'sante', 'resilie', 31320, 131740, '2022-08-10', '2024-10-01', 'annuel');


-- ============================================================
-- SECTION 16: D02 - PRETS AVANCES (12)
-- ============================================================

INSERT INTO public.d02_prets_avances (id, employe_id, tenant_id, type_pret, montant, date_octroi, echeance_mois, taux_interet, mensualite, solde_restant, statut, date_fin_prevue) VALUES
  ('e6be1f38-13e8-4333-8239-099a0f570df0', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_social', 1957780, '2024-08-22', 31, 1.61, 63154, 1802241, 'en_cours', NULL),
  ('934218f4-08b2-4a27-a092-868f01a83912', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_scolarite', 1359290, '2025-11-26', 23, 1.47, 59100, 1094236, 'en_retard', NULL),
  ('0d8ad3de-7fa6-4555-aaaa-8f98d2974c23', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_salaire', 1713240, '2025-08-15', 10, 2.26, 171324, 1593444, 'cloture', NULL),
  ('2c551c65-38ab-409f-8958-ae15c75f54f2', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_scolarite', 1001060, '2024-09-06', 28, 1.56, 35752, 837208, 'en_cours', NULL),
  ('66d1d785-379e-4ed9-a162-e0ec14cafd83', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_social', 370110, '2024-09-02', 33, 4.16, 11215, 357891, 'cloture', NULL),
  ('cdeb02ae-a0f9-4caf-b5f3-bd53a3afd90e', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_salaire', 1599370, '2024-08-01', 26, 2.93, 61514, 1304937, 'en_retard', NULL),
  ('6f44a18d-a50e-465b-b1e3-ae6efdb000a4', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_logement', 306340, '2025-08-08', 29, 4.34, 10563, 299597, 'en_cours', '2027-06-21'),
  ('d8f9ac3f-6d48-40f0-af05-c41cfafff533', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_salaire', 267270, '2024-11-06', 35, 3.28, 7636, 237878, 'en_cours', NULL),
  ('51e39d9d-cdcd-4c2c-89a3-caf6bef39ec0', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_social', 1216570, '2025-03-13', 26, 2.87, 46791, 991592, 'en_retard', '2028-08-14'),
  ('9e020125-6004-40a5-ad2e-34a2cf42163c', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_social', 105060, '2024-12-02', 20, 1.37, 5253, 80078, 'en_cours', '2027-06-19'),
  ('6ff7e82a-1b9f-4691-8c3c-5ad977a6c7e4', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_salaire', 62800, '2025-07-16', 14, 0.35, 4486, 61796, 'en_cours', '2026-09-14'),
  ('e6aab635-a88e-497c-9cea-91179499cd29', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pret_scolarite', 838940, '2025-05-16', 29, 0.79, 28929, 757247, 'en_cours', '2028-09-05');


-- ============================================================
-- SECTION 17: D02 - SANCTIONS DISCIPLINAIRES (8)
-- ============================================================

INSERT INTO public.d02_sanctions_disciplinaires (id, employe_id, tenant_id, type_sanction, date_sanction, motif, statut, reference, decide_par, date_notification) VALUES
  ('8c1e41f0-ebae-48e7-bcf0-32aa05d5a21a', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avertissement', '2025-01-27', 'Absences repetees non justifiees', 'actif', '2025/DISC-100', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-03-22'),
  ('b9d8c7e2-e35f-4d5e-8851-7a40c4bd4020', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avertissement', '2025-12-12', 'Retards frequents', 'actif', '2025/DISC-101', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-20'),
  ('9c77c98e-1a35-4254-a0ae-077946bf7bbb', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'retenue_salaire', '2025-12-05', 'Non-respect des procedures internes', 'levee', '2025/DISC-102', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-09-06'),
  ('b00409e4-2cb7-456e-8a2b-50932de3f763', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'retenue_salaire', '2025-08-01', 'Contraire a l''ethique professionnelle', 'archive', '2025/DISC-103', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-04-21'),
  ('ecf38d89-6f99-401b-93c3-009a8d20bff1', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avertissement', '2025-06-26', 'Negligence dans l''execution des taches', 'levee', '2025/DISC-104', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-02-26'),
  ('f41b3e85-04d7-42b5-acec-12b3e8019f1e', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mise_a_pied', '2025-12-14', 'Conflit avec un collegue', 'levee', '2025/DISC-105', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-09-27'),
  ('f612469c-74ef-4b1a-b95a-d00d6f896198', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mise_a_pied', '2025-01-24', 'Utilisation non autorisee du materiel', 'actif', '2025/DISC-106', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-07-22'),
  ('f2f87a20-9c97-4187-8f10-e7e11d3c278c', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avertissement', '2025-01-04', 'Non-respect des horaires', 'actif', '2025/DISC-107', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-04');


-- ============================================================
-- SECTION 18: D02 - VISITES MEDICALES (20)
-- ============================================================

INSERT INTO public.d02_visites_medicales (id, employe_id, tenant_id, type_visite, date_visite, medecin, lieu, resultat, observations, statut, date_prochaine) VALUES
  ('f0b83d2c-6c0a-4a92-b554-5a962b5b5493', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2023-10-09', 'Dr. Tchinda Paul', 'Yaoundé', 'favorable', 'Suivi medical recommande', 'actif', '2025-05-31'),
  ('ff0287b3-1ec6-4083-adfd-2ba58d995b58', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2023-09-22', 'Dr. Kamga Suzanne', 'Douala', 'contre_indication', 'Aucune observation', 'archive', '2024-12-26'),
  ('52f039a3-7f55-4ab1-9cf1-dc0f884956d4', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'embauche', '2025-03-24', 'Dr. Fotso Alfred', 'Yaoundé', 'favorable', 'Aucune observation', 'actif', '2024-10-03'),
  ('403f9606-e434-4359-93a7-ec82b4aab7ea', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnelle', '2026-03-20', 'Dr. Kamga Suzanne', 'Yaoundé', 'favorable', 'Suivi medical recommande', 'actif', '2024-10-27'),
  ('e5db40f0-8386-461a-a035-5b7bebf03c36', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2025-07-31', 'Dr. Tchinda Paul', 'Douala', 'reserve', 'Aucune observation', 'actif', '2025-06-11'),
  ('b3806d81-603a-4b35-96a0-094d800f5985', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnelle', '2025-12-09', 'Dr. Fotso Alfred', 'Yaoundé', 'favorable', 'Aucune observation', 'actif', '2024-11-13'),
  ('8907ea99-8596-4191-a490-4ede18379ab0', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2023-06-06', 'Dr. Fotso Alfred', 'Douala', 'favorable', 'Aucune observation', 'archive', '2023-10-30'),
  ('a2e0668b-de6c-4eae-801b-2245712ec958', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2023-07-30', 'Dr. Nganou Claire', 'Yaoundé', 'favorable', 'Suivi medical recommande', 'actif', '2023-06-04'),
  ('d7011a17-29a7-48bd-bf8b-fdca330a2db3', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2025-10-08', 'Dr. Kamga Suzanne', 'Yaoundé', 'contre_indication', 'Aucune observation', 'archive', '2024-10-23'),
  ('836081aa-8cab-49cf-9bbb-1bf52ddc6182', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reprise', '2023-11-06', 'Dr. Kamga Suzanne', 'Douala', 'reserve', 'Aucune observation', 'actif', '2024-07-16'),
  ('d22cd9fe-82c0-4c82-9a89-4db51b7b2fda', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'embauche', '2024-12-21', 'Dr. Fotso Alfred', 'Yaoundé', 'reserve', 'Aucune observation', 'actif', '2025-01-25'),
  ('eb963abd-5979-416d-9817-64611a4b11b6', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reprise', '2023-06-07', 'Dr. Fotso Alfred', 'Yaoundé', 'reserve', 'Aucune observation', 'archive', '2023-03-26'),
  ('a74d629d-15df-4a1d-bf7d-c0be1822e239', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnelle', '2026-03-16', 'Dr. Nganou Claire', 'Yaoundé', 'contre_indication', 'Aucune observation', 'actif', '2023-05-07'),
  ('8d9b3c33-c362-4653-aed0-8182b2731b2b', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnelle', '2023-07-31', 'Dr. Tchinda Paul', 'Douala', 'contre_indication', 'Aucune observation', 'actif', '2024-05-22'),
  ('5b80b720-6239-4511-a93a-bd204b16f1be', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnelle', '2025-06-18', 'Dr. Nganou Claire', 'Yaoundé', 'favorable', 'Aucune observation', 'actif', '2025-04-17'),
  ('3b8d2e3f-bac8-497f-ab07-ff55fa88fc82', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reprise', '2026-05-09', 'Dr. Fotso Alfred', 'Yaoundé', 'favorable', 'Aucune observation', 'archive', '2025-03-02'),
  ('3d2a112f-5e4a-4612-8362-47094bb7e1c3', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reprise', '2024-05-31', 'Dr. Nganou Claire', 'Yaoundé', 'favorable', 'Aucune observation', 'actif', '2024-12-17'),
  ('177292ca-6fe0-4fcf-9645-bcebb75d4770', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reprise', '2025-03-13', 'Dr. Nganou Claire', 'Douala', 'favorable', 'Aucune observation', 'archive', '2024-11-03'),
  ('1cf80b07-40b1-491c-aa2c-b915a30f8a63', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2025-12-14', 'Dr. Fotso Alfred', 'Yaoundé', 'contre_indication', 'Aucune observation', 'actif', '2024-09-24'),
  ('bde4fb7a-bea3-46e0-b430-8d9f8803aaa3', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'periodique', '2024-03-14', 'Dr. Tchinda Paul', 'Yaoundé', 'favorable', 'Suivi medical recommande', 'actif', '2023-11-14');


-- ============================================================
-- SECTION 19: D05 - CONVENTIONS COLLECTIVES (5)
-- ============================================================

INSERT INTO public.d05_conventions_collectives (id, tenant_id, code, nom, taux_horaire_min, categories, date_effet, date_expiration, statut, description) VALUES
  ('d44d65d1-8969-4ac0-aae3-633cd1d47dc0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'IDCC-001', 'Convention Collective du Commerce et de la Distribution', 397, 'A1 a D3', '2023-03-21', '2025-10-30', 'active', 'Convention IDCC-001'),
  ('fbba29fd-9182-45ba-b978-54f7af6c4bea', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'IDCC-002', 'Convention Collective des Metiers de l''Informatique', 580, 'T1 a T4', '2023-04-14', '2026-06-04', 'active', 'Convention IDCC-002'),
  ('349f9f04-d2dc-433a-884b-294ffb005dcc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'IDCC-003', 'Convention Collective des Industries Mecaniques', 420, 'O1 a P4', '2023-02-08', '2026-11-09', 'active', 'Convention IDCC-003'),
  ('31769f48-5a6a-42f8-ba36-95a4d0a0a059', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'IDCC-004', 'Convention Nationale Interprofessionnelle du Cameroun', 368, 'A a H', '2023-12-11', '2026-09-25', 'active', 'Convention IDCC-004'),
  ('902ca92f-ee6b-4518-b9b6-7f151d3d7c7a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'IDCC-005', 'Convention Collective du Batiment et Travaux Publics', 385, 'C1 a E4', '2023-05-15', '2026-09-04', 'archivee', 'Convention IDCC-005');


-- ============================================================
-- SECTION 20: D05 - COTISATIONS SOCIALES (8)
-- ============================================================

INSERT INTO public.d05_cotisations_sociales (id, tenant_id, code, organisme, libelle, taux, nature, periodicite, statut, date_effet) VALUES
  ('ba3e5867-6434-4051-b082-021a936743aa', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-001', 'CNPS', 'Pension vieillesse employeur', 4.2, 'obligatoire', 'mensuel', 'actif', '2024-04-02'),
  ('461de655-2332-4028-9c59-fe741f6db4c6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-002', 'CNPS', 'Pension vieillesse salarie', 2.8, 'facultatif', 'trimestriel', 'actif', '2024-08-12'),
  ('bef7f9a5-fe72-4d71-86a5-5ffb7425637f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-003', 'CNPS', 'Allocations familiales', 7.0, 'obligatoire', 'mensuel', 'actif', '2024-12-12'),
  ('7afc5603-274f-44a6-bddc-94c18b989bbc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-004', 'CNPS', 'Accident de travail', 2.0, 'facultatif', 'mensuel', 'actif', '2024-11-08'),
  ('2add8a33-85be-4770-b278-1ef0e8acd088', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-005', 'CNSS', 'Prestations familiales', 2.5, 'obligatoire', 'trimestriel', 'actif', '2024-04-29'),
  ('7ddbc3a0-d071-487e-9111-6a298fbea899', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-006', 'FNE', 'Fonds National Emploi', 1.0, 'facultatif', 'mensuel', 'actif', '2024-08-28'),
  ('5181cb44-0461-4d90-8b44-78a2cb58b64f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-007', 'Mutuelle IPRES', 'Maladie employeur', 3.0, 'obligatoire', 'mensuel', 'actif', '2024-10-19'),
  ('cc98ee81-5272-41c7-b0cb-eba36f8c1822', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'COT-008', 'Mutuelle IPRES', 'Maladie salarie', 1.5, 'obligatoire', 'mensuel', 'actif', '2024-07-14');


-- ============================================================
-- SECTION 21: D05 - ELEMENTS PAIE (30)
-- ============================================================

INSERT INTO public.d05_elements_paie (id, employe_id, contrat_id, tenant_id, periode, type_element, libelle, montant_base, montant_calcul, montant_final, statut) VALUES
  ('4a3bf729-5b6e-4540-9b70-8d5649ab6912', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '1f68b09a-af02-4123-814c-e2dcc8af50df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'cotisation', 'CNSS employe', 281540, 22523, 281540, 'valide'),
  ('cd842d4d-5c28-4ec3-86c5-52a38e9a975e', '65f95479-3f97-4e74-91f7-761f41257843', '3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'indemnite', 'Indemnite de fonction', 74710, NULL, 74710, 'valide'),
  ('5854910d-2ea2-431d-a709-dc14dd1ca5a0', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', 'ce563240-0a54-427e-90d1-a172b9edfcc6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'cotisation', 'CNPS employe', 451260, 9025, 451260, 'valide'),
  ('acc75b5c-b559-4c30-a519-70a6397b86dc', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'b85a8eaa-3b53-4ede-984f-ccd57083c961', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'indemnite', 'Indemnite de fonction', 491140, NULL, 491140, 'valide'),
  ('cff655a2-c014-43d9-8200-8cd307966b3d', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '0d734884-8104-428c-b4b8-d6f017a0467c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'prime', 'Prime d''anciennete', 493040, NULL, 493040, 'brouillon'),
  ('cb9f3390-d438-42fc-9e0d-f55b6134efab', 'ebd9079a-f426-4c86-9537-0d839b042e93', 'd19d44fd-0052-4688-bcae-7990ec980414', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'salaire_base', 'Salaire de base mensuel', 435710, NULL, 435710, 'brouillon'),
  ('8c0e6576-8af0-4c47-825e-5e56a4e469cc', '1fd4257c-0dd3-4185-a3af-808e4698d422', '9df6a7b6-421d-4ddf-8a3e-fa92618a4511', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'salaire_base', 'Salaire de base mensuel', 413120, NULL, 413120, 'en_attente'),
  ('7627d407-de05-470c-8aa9-c42db4f47581', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'c00593f6-cfaf-4b34-82e4-20ad9a927cc9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'salaire_base', 'Salaire de base mensuel', 769420, NULL, 769420, 'valide'),
  ('c961e229-0b42-45be-844a-df9f606a0122', '95575fac-569c-4ce8-baec-a455a421537d', '8377827a-2216-45c6-bb87-e3d9362133f2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'salaire_base', 'Salaire de base mensuel', 320810, NULL, 320810, 'brouillon'),
  ('05593b82-abc6-4cc8-82dd-fcc1558032e7', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '5478a178-8606-4eb1-8897-2fa9f8c4b2ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'retenue', 'Avance sur salaire', 327620, NULL, 327620, 'valide'),
  ('d4355aef-cf91-4bac-9dee-a7dbc9a36867', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '1cd1da00-6658-4484-b12a-cb2c85d66006', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'indemnite', 'Indemnite de fonction', 246130, NULL, 246130, 'valide'),
  ('b6a55e81-53c3-4a0b-a480-ed1709da8013', '0431f18d-1482-40bc-bd49-a749ffa68094', '74c63929-7e77-47ed-a559-9953dff26fd5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'indemnite', 'Indemnite de transport', 269180, NULL, 269180, 'valide'),
  ('1a37ce9e-8c54-4b11-821c-db0719165672', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', 'a685e375-99d5-479b-8718-2844f517c4ac', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'prime', 'Prime d''anciennete', 460220, NULL, 460220, 'valide'),
  ('79c81885-fa42-493a-ad4e-6e221b22feb4', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '347dada1-f081-4c0c-9fa7-85ff63756074', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'retenue', 'Avance sur salaire', 317860, NULL, 317860, 'valide'),
  ('00a13a2a-2905-4500-a74c-3afcd9c7e3cf', '234c72a5-919c-4d02-99c8-9702006db7cd', '90d5b3b7-7d2c-4b8a-82c7-7e7a6cac6ca4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'indemnite', 'Indemnite de fonction', 470090, NULL, 470090, 'valide'),
  ('754f4c55-95e7-4fe3-b577-808c2594ddab', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '64f4db72-9d56-4e21-9c81-fb6bf185d6f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'cotisation', 'Mutuelle sante', 223400, 15638, 223400, 'en_attente'),
  ('bf50d155-cbf7-4b27-bc6e-56059875ca52', '07f73f09-8fdf-4b80-b108-c86549a98028', '928913bd-d424-4e13-8898-8ba8939d2e11', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'salaire_base', 'Salaire de base mensuel', 571610, NULL, 571610, 'brouillon'),
  ('6cf74c3d-510a-4525-b6f4-c213849b1cfc', '7f16aac0-e821-4e13-9f8e-d59940cda288', 'c6eb3b5a-ac69-4aac-b6d0-c493ea2a4a28', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'salaire_base', 'Salaire de base mensuel', 686550, NULL, 686550, 'en_attente'),
  ('26199d4b-58d1-45fa-b960-d60adcb076bb', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '2a62514b-9c2a-4a9d-94f1-fe7bf9b3853f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'salaire_base', 'Salaire de base mensuel', 394440, NULL, 394440, 'valide'),
  ('9b704771-26c4-47bb-bc33-a87cd6c329da', 'c384e532-75ff-4c20-b835-e312a56b2acc', '2a1f54b1-0c42-47c4-9ca8-6b5846290250', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'salaire_base', 'Salaire de base mensuel', 630170, NULL, 630170, 'valide'),
  ('46f68a6d-9612-42b4-898b-b10bb889e1bd', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '1f68b09a-af02-4123-814c-e2dcc8af50df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'indemnite', 'Indemnite de transport', 592540, NULL, 592540, 'brouillon'),
  ('a57f9d0f-f476-4849-91a2-c9b2d2f32d15', '65f95479-3f97-4e74-91f7-761f41257843', '3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'retenue', 'Avance sur salaire', 336210, NULL, 336210, 'valide'),
  ('7cd0a1f4-9de0-474f-b2c7-ae9d6b971d3a', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', 'ce563240-0a54-427e-90d1-a172b9edfcc6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'retenue', 'Avance sur salaire', 24390, NULL, 24390, 'valide'),
  ('6d090ef0-dd41-4190-bb2d-bb21b9ffc8ca', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'b85a8eaa-3b53-4ede-984f-ccd57083c961', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'prime', 'Prime de rendement', 63940, NULL, 63940, 'brouillon'),
  ('bb2097bf-0e5f-46f7-a59b-dab5b30cc817', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '0d734884-8104-428c-b4b8-d6f017a0467c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'cotisation', 'CNSS employe', 253200, 20256, 253200, 'valide'),
  ('2c08092d-07fe-474a-a857-3c57bc3bc846', 'ebd9079a-f426-4c86-9537-0d839b042e93', 'd19d44fd-0052-4688-bcae-7990ec980414', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 'indemnite', 'Indemnite de fonction', 394310, NULL, 394310, 'en_attente'),
  ('cfbf0e1e-a5dd-4a02-9bf3-5c2df0e37592', '1fd4257c-0dd3-4185-a3af-808e4698d422', '9df6a7b6-421d-4ddf-8a3e-fa92618a4511', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'salaire_base', 'Salaire de base mensuel', 405900, NULL, 405900, 'brouillon'),
  ('e2a8d5b1-376a-4183-bc0c-6aee649ab78c', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'c00593f6-cfaf-4b34-82e4-20ad9a927cc9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'retenue', 'Retenue pour pret', 182750, NULL, 182750, 'brouillon'),
  ('587ca8ab-1cfc-44f3-9d2e-11203d648401', '95575fac-569c-4ce8-baec-a455a421537d', '8377827a-2216-45c6-bb87-e3d9362133f2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 'indemnite', 'Indemnite de transport', 564500, NULL, 564500, 'brouillon'),
  ('be49d174-0107-44d2-af33-11626e1069d1', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '5478a178-8606-4eb1-8897-2fa9f8c4b2ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 'salaire_base', 'Salaire de base mensuel', 471520, NULL, 471520, 'en_attente');


-- ============================================================
-- SECTION 22: D05 - BULLETINS PAIE (24)
-- ============================================================

INSERT INTO public.d05_bulletins_paie (id, employe_id, contrat_id, tenant_id, periode, salaire_brut, total_cotisations, total_retenues, salaire_net, nb_heures_travaillees, nb_jours_absence, deductions_absences, statut, date_generation) VALUES
  ('a7a4aba9-6e57-46b8-8cbc-d001c732c3cf', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '1f68b09a-af02-4123-814c-e2dcc8af50df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 415160, 30490, 87500, 384670, 152.26, 19, 47030, 'envoye', '2025-05-22'),
  ('3ce76f00-5d2a-4df8-a21d-956b06247ccc', '65f95479-3f97-4e74-91f7-761f41257843', '3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1646540, 252740, 127210, 1393800, 141.69, 11, 40290, 'envoye', '2025-06-05'),
  ('753a3c71-723d-4938-ab36-f9fdb44f1562', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', 'ce563240-0a54-427e-90d1-a172b9edfcc6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 1541060, 50070, 116480, 1490990, 154.53, 5, 2040, 'genere', '2025-06-26'),
  ('0cf72f4d-5306-4438-b913-91b5c45e23b2', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'b85a8eaa-3b53-4ede-984f-ccd57083c961', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 272980, 28270, 71860, 244710, 171.14, 11, 23730, 'envoye', '2025-07-12'),
  ('70fe35fc-8c3f-4fc4-a61d-9f7856d3fba1', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '0d734884-8104-428c-b4b8-d6f017a0467c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 267920, 59660, 127940, 208260, 177.95, 11, 29090, 'brouillon', '2025-07-13'),
  ('b058fc85-4457-4487-9569-763d2d9b630f', 'ebd9079a-f426-4c86-9537-0d839b042e93', 'd19d44fd-0052-4688-bcae-7990ec980414', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 488770, 89400, 114340, 399370, 152.58, 8, 16360, 'brouillon', '2025-05-04'),
  ('b0002d41-0580-4475-a6fe-2e958cb009d3', '1fd4257c-0dd3-4185-a3af-808e4698d422', '9df6a7b6-421d-4ddf-8a3e-fa92618a4511', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1742820, 117540, 145720, 1625280, 155.48, 17, 7720, 'genere', '2025-06-03'),
  ('f92b7c51-3a1c-4cde-b8ed-c41b9072da6f', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'c00593f6-cfaf-4b34-82e4-20ad9a927cc9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 1676470, 253980, 84860, 1422490, 167.76, 15, 13120, 'brouillon', '2025-05-18'),
  ('cdbcd3a8-50cc-4f54-a57b-f570e30385a0', '95575fac-569c-4ce8-baec-a455a421537d', '8377827a-2216-45c6-bb87-e3d9362133f2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 355300, 79250, 126680, 276050, 179.89, 10, 43770, 'genere', '2025-05-09'),
  ('4abc9db7-885e-4c9c-a4ec-bc92dde67479', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '5478a178-8606-4eb1-8897-2fa9f8c4b2ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1353430, 304250, 88630, 1049180, 174.05, 20, 11410, 'genere', '2025-07-05'),
  ('447afa74-c6ab-41c7-b7ab-0b1a63ce3321', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '1cd1da00-6658-4484-b12a-cb2c85d66006', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 670270, 51810, 46400, 618460, 149.47, 15, 1720, 'genere', '2025-07-10'),
  ('1266a94d-31fb-44f3-b553-40f92fe55dc6', '0431f18d-1482-40bc-bd49-a749ffa68094', '74c63929-7e77-47ed-a559-9953dff26fd5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1400150, 213420, 44020, 1186730, 164.48, 2, 4310, 'genere', '2025-06-20'),
  ('faaeb163-4c0f-45b3-98eb-4145d4d81118', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', 'a685e375-99d5-479b-8718-2844f517c4ac', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1703520, 396890, 147810, 1306630, 156.43, 13, 37680, 'brouillon', '2025-05-17'),
  ('c60d0c54-ec68-414d-87fb-c4304278cd7b', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '347dada1-f081-4c0c-9fa7-85ff63756074', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 864860, 188380, 127960, 676480, 158.63, 16, 22580, 'genere', '2025-07-10'),
  ('ce02f064-2259-4bfc-8f66-cda5bac33781', '234c72a5-919c-4d02-99c8-9702006db7cd', '90d5b3b7-7d2c-4b8a-82c7-7e7a6cac6ca4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 1541740, 328170, 43820, 1213570, 157.3, 1, 8140, 'envoye', '2025-05-20'),
  ('3fdb3ec4-8f69-4df5-bd8b-7fbae4ddfc72', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '64f4db72-9d56-4e21-9c81-fb6bf185d6f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 837800, 63160, 94580, 774640, 177.39, 7, 22680, 'envoye', '2025-06-06'),
  ('ef2aa987-d393-4c49-b0ae-1b3aa32d02ac', '07f73f09-8fdf-4b80-b108-c86549a98028', '928913bd-d424-4e13-8898-8ba8939d2e11', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 365380, 52850, 81940, 312530, 145.01, 9, 40270, 'envoye', '2025-05-12'),
  ('5cce45fe-1e38-4164-9759-af1dcdd0d753', '7f16aac0-e821-4e13-9f8e-d59940cda288', 'c6eb3b5a-ac69-4aac-b6d0-c493ea2a4a28', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 1253970, 108410, 50420, 1145560, 146.85, 19, 47230, 'envoye', '2025-06-13'),
  ('60a966d6-92af-4730-9594-4ab5ed04ca17', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '2a62514b-9c2a-4a9d-94f1-fe7bf9b3853f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 1381990, 41600, 31290, 1340390, 141.82, 20, 37800, 'genere', '2025-05-27'),
  ('c499670e-81e8-43d3-a76d-26f3fb54fa48', 'c384e532-75ff-4c20-b835-e312a56b2acc', '2a1f54b1-0c42-47c4-9ca8-6b5846290250', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 1399860, 238410, 17940, 1161450, 159.92, 20, 35750, 'genere', '2025-06-08'),
  ('eeda8a20-cd55-4367-b0d7-da466d2658ad', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '1f68b09a-af02-4123-814c-e2dcc8af50df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', 1212810, 148390, 116450, 1064420, 151.9, 2, 45130, 'brouillon', '2025-05-21'),
  ('18d306c3-5223-42eb-a66b-7e4781a929ab', '65f95479-3f97-4e74-91f7-761f41257843', '3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1121920, 128950, 131750, 992970, 148.16, 19, 9420, 'genere', '2025-06-10'),
  ('cc72bae4-baad-418a-99f7-793f7eb06b4d', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', 'ce563240-0a54-427e-90d1-a172b9edfcc6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-01', 1739730, 201070, 44280, 1538660, 170.43, 16, 36810, 'brouillon', '2025-06-10'),
  ('255ec4f9-444f-43b5-9098-25c16ead1e7b', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'b85a8eaa-3b53-4ede-984f-ccd57083c961', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 706960, 142280, 80120, 564680, 157.98, 4, 6340, 'brouillon', '2025-06-07');


-- ============================================================
-- SECTION 23: D05 - PRIMES (18)
-- ============================================================

INSERT INTO public.d05_primes (id, employe_id, tenant_id, type_prime, montant, periode, motif, statut, valide_par, date_validation) VALUES
  ('8b279baf-24f7-4dcb-afd9-4e1bae2fff23', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'logement', 347640, '2025-05-01', 'Objectifs depasses du trimestre', 'validee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-22'),
  ('535ded4a-8ec8-4ab5-9a47-65f94068c761', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'responsabilite', 327870, '2025-06-01', 'Responsabilite accrue', 'validee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-18'),
  ('804a5d4a-d637-442c-981e-36655085f67b', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'rendement', 286230, '2025-06-01', 'Indemnite pour frais de logement', 'payee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-26'),
  ('eccb2a4c-4ad8-4435-9f34-437fed7c6acc', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'responsabilite', 285760, '2025-04-01', 'Anciennete dans le poste', 'payee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-02'),
  ('1b010071-01a2-482d-b01c-fcea617c1e5e', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'logement', 151210, '2025-04-01', 'Prime annuelle legale', 'demandee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-04'),
  ('881ab414-dcbd-4ee0-aa57-0ca687f784f9', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'anciennete', 172510, '2025-05-01', 'Prime annuelle legale', 'payee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-19'),
  ('43a379f9-5da6-4a46-95b1-1867d2d6cc0e', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fin_annee', 29290, '2025-04-01', 'Indemnite pour frais de logement', 'validee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-26'),
  ('7b84fe5d-b048-4df5-977e-7f4bb5244442', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'responsabilite', 216770, '2025-05-01', 'Responsabilite accrue', 'validee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-26'),
  ('7721ac06-7249-47a8-9e7a-3a633bd781a2', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'anciennete', 323990, '2025-06-01', 'Objectifs depasses du trimestre', 'demandee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-05'),
  ('d32d8975-6caa-4dce-9ecb-12073d8f269b', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'responsabilite', 63550, '2025-05-01', 'Prime annuelle legale', 'payee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-18'),
  ('b0138735-76d2-40cd-bb62-c2d6bbe125d4', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fin_annee', 171650, '2025-06-01', 'Assiduite exemplaire', 'rejetee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-08'),
  ('e2158dfc-d9cc-4e1f-9c39-4eb644cc5a79', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'rendement', 75690, '2025-05-01', 'Responsabilite accrue', 'demandee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-05'),
  ('822300b8-e60f-45a3-b773-3e9381fe2cb2', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'responsabilite', 100640, '2025-04-01', 'Prime annuelle legale', 'rejetee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-26'),
  ('b1cdb50c-9a4b-4356-a46c-71fec2b038aa', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fin_annee', 46100, '2025-04-01', 'Anciennete dans le poste', 'validee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-15'),
  ('7df448f7-2935-45a6-801c-2f53b57a436c', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'responsabilite', 273380, '2025-06-01', 'Indemnite pour frais de logement', 'validee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-08'),
  ('599735fe-ff1a-43b6-884c-f4d5aed52311', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fin_annee', 98280, '2025-05-01', 'Prime annuelle legale', 'demandee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-11'),
  ('3fa1c25a-9142-4145-bcbc-ad50367f8c64', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'logement', 348220, '2025-06-01', 'Responsabilite accrue', 'rejetee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-22'),
  ('66ada490-7ac4-4bb6-99e0-39fd2cf652fe', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fin_annee', 292240, '2025-06-01', 'Indemnite pour frais de logement', 'rejetee', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-20');


-- ============================================================
-- SECTION 24: D05 - RETENUES (12)
-- ============================================================

INSERT INTO public.d05_retenues (id, employe_id, tenant_id, type_retenue, montant, periode, motif, statut, periodicite, echeance_restante) VALUES
  ('a79da48c-b4c4-4730-93a1-e4504790aaa0', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'saisie_arret', 14360, '2025-05-01', 'Remboursement avance sur salaire', 'termine', 'mensuel', 10),
  ('079ee3cc-cef8-4a13-9cad-e793df9e2b2b', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_remboursable', 16980, '2025-06-01', 'Saisie-arret creancier', 'actif', 'ponctuel', 10),
  ('65516d60-338d-428c-8877-cb9358d8c358', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pension_alimentaire', 23460, '2025-06-01', 'Saisie-arret creancier', 'actif', 'ponctuel', 10),
  ('b5cb2912-a1fb-4e53-bdeb-15a55307807e', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'saisie_arret', 48740, '2025-06-01', 'Pension alimentaire - decision tribunal', 'actif', 'ponctuel', 2),
  ('2a8bd401-5450-4b29-839e-3f6e2cea44df', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pension_alimentaire', 14960, '2025-05-01', 'Remboursement avance sur salaire', 'actif', 'mensuel', NULL),
  ('148477c9-b2b2-4e7c-ad20-55fdfb314fcb', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pension_alimentaire', 117580, '2025-06-01', 'Saisie-arret creancier', 'termine', 'ponctuel', NULL),
  ('ff5770e7-1c76-485d-8b0c-b826e085f452', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pension_alimentaire', 145970, '2025-04-01', 'Remboursement avance sur salaire', 'termine', 'mensuel', 6),
  ('64c9a731-f465-4467-aeb2-29e13c32e733', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'pension_alimentaire', 130500, '2025-06-01', 'Remboursement avance sur salaire', 'termine', 'mensuel', 12),
  ('61aa8b8a-569f-4ea0-8ebe-d9963c65f4dd', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_remboursable', 136920, '2025-04-01', 'Pension alimentaire - decision tribunal', 'actif', 'ponctuel', NULL),
  ('061b2799-4414-41ee-bbcb-34e6500abbaa', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'avance_remboursable', 85760, '2025-06-01', 'Pension alimentaire - decision tribunal', 'termine', 'ponctuel', NULL),
  ('95c13c15-f9c7-4f54-9bee-04a3344a94a3', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'saisie_arret', 101440, '2025-06-01', 'Remboursement avance sur salaire', 'actif', 'mensuel', 9),
  ('4623039b-40bb-4605-8ab1-c9c28d1b8a36', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'saisie_arret', 113420, '2025-05-01', 'Pension alimentaire - decision tribunal', 'actif', 'mensuel', NULL);


-- ============================================================
-- SECTION 25: D05 - HISTORIQUE SALAIRES (20)
-- ============================================================

INSERT INTO public.d05_historique_salaires (id, employe_id, tenant_id, date_effet, ancien_salaire, nouveau_salaire, variation_pct, motif, type_modification, valide_par) VALUES
  ('49149c88-cfab-48e9-8486-ffbde525af30', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-03-28', 315740, 343390, 8.76, 'Reclassement', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('4cb2a24d-1383-426f-b3fd-d291a3d867b6', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-07-26', 1154700, 1148140, -0.57, 'Avenant au contrat', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('253eb004-1899-4b8f-a324-74e9b6c0a40e', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-04-22', 719630, 647670, -10.0, 'Avenant au contrat', 'reajustement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('9244f335-e439-4a16-a38f-20e8f4d9947a', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-02-21', 651810, 648560, -0.5, 'Reclassement', 'reajustement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('82f14fba-5e7a-4077-a6b5-e9f9554bc00a', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-02-23', 623270, 620690, -0.41, 'Promotion interne', 'diminution', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('59f7d8f8-1239-48ea-8eda-1245e82b40aa', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-04-28', 842680, 1050250, 24.63, 'Promotion interne', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('3b02a7e2-511c-4455-858f-f4e48951e7e4', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-06-11', 160870, 200830, 24.84, 'Revision salariale', 'diminution', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('6ae12143-6eef-4fbb-9137-f539f56fb27f', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-02-13', 1151280, 1130170, -1.83, 'Changement de poste', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('d1068918-79ab-440e-9b31-559b8372ddaf', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-03-02', 748560, 937480, 25.24, 'Promotion interne', 'reajustement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('c40ff213-3320-45d8-a5ad-d0450931156d', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-26', 637000, 790170, 24.05, 'Reclassement', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('2be5a122-0ae7-400e-9461-22a3bf385919', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-07', 517140, 523260, 1.18, 'Augmentation annuelle', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('380aa5df-b15b-43ec-9585-4c07f0ac8f44', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-05-22', 982560, 1199170, 22.05, 'Augmentation annuelle', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('2806a01c-bcb9-4c19-8d93-04ef394d8742', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-11-02', 228570, 184070, -19.47, 'Avenant au contrat', 'reajustement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('bea9bdbd-fd9b-47fb-8ff5-bd7cce3d4e4a', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-10-19', 375020, 387840, 3.42, 'Revision salariale', 'reajustement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('58bcd9fd-6082-4017-8839-3abea58b9dd9', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-21', 1185810, 1089370, -8.13, 'Avenant au contrat', 'diminution', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('f0fb550a-c410-4301-9330-5abef3432bef', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-08', 722180, 678830, -6.0, 'Promotion interne', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('8c599966-276c-49b5-a984-3fdb2bb75a00', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-04-14', 490780, 584280, 19.05, 'Reclassement', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('814d302e-aefa-4625-ba98-82a623ca02d7', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-24', 540490, 439780, -18.63, 'Changement de poste', 'augmentation', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('d7ae787e-56fc-4732-80c9-f2f0019277e9', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-09-17', 555090, 536080, -3.42, 'Reclassement', 'diminution', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191'),
  ('6667aa91-e669-4c23-b5ed-2961912b1ba9', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2023-12-02', 1046960, 1107720, 5.8, 'Promotion interne', 'diminution', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191');


-- ============================================================
-- SECTION 26: D05 - PREVISIONS PAIE (12)
-- ============================================================

INSERT INTO public.d05_previsions_paie (id, tenant_id, structure_id, periode, masse_salariale_prevue, masse_salariale_reelle, ecart, nb_employes_prevu, statut) VALUES
  ('c6103c1a-ee05-4981-910a-647387f22536', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '2025-08-01', 3800150, NULL, NULL, 12, 'prevision'),
  ('f2842acd-d7b0-4953-a6e7-3e5b3e7424e5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '2025-10-01', 5080770, NULL, NULL, 8, 'prevision'),
  ('6945d78a-3fc4-43f7-8ee9-87a153150ea4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '2025-07-01', 5239710, 5032350, -207360, 9, 'ecart_defavorable'),
  ('cb1b2ea6-84a3-4bda-b7f8-6e46baf8526f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '2025-07-01', 6016140, 5544810, -471330, 12, 'prevision'),
  ('34e537d5-2640-4703-9aee-2c11afa35476', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '2025-09-01', 4339800, 4432750, 92950, 6, 'ecart_defavorable'),
  ('bf0beb5b-6d12-44f1-beed-b459149c743e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '2025-08-01', 5474950, NULL, NULL, 8, 'realise'),
  ('b1d633ff-2e2b-4ad8-b2cf-31f828c0f2c0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fc560397-f042-4cea-888a-883660af34b9', '2025-09-01', 7011280, NULL, NULL, 11, 'ecart_defavorable'),
  ('1319cc3e-ec1e-4197-b06b-15d0e71b6b65', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '2025-08-01', 7607310, 7973840, 366530, 8, 'ecart_defavorable'),
  ('ce085e26-f815-43fa-84ba-1d122275c36e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '2025-10-01', 7998050, 7369940, -628110, 13, 'ecart_defavorable'),
  ('aa8c4830-68b5-4347-b625-b70758cbe6af', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '2025-07-01', 6034870, NULL, NULL, 5, 'ecart_favorable'),
  ('61d523c2-315d-4aed-8a10-86539ca580d4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '2025-08-01', 7240330, NULL, NULL, 7, 'prevision'),
  ('f761c422-423e-458e-9b98-89a9198a09b0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '2025-08-01', 7364940, 8055130, 690190, 14, 'prevision');


-- ============================================================
-- SECTION 27: D12 - JOURS FERIES (14)
-- ============================================================

INSERT INTO public.d12_calendrier_jours_feries (id, tenant_id, annee, nom, date_jour, type_jour, zone_application, est_recuperable) VALUES
  ('8636bec8-12af-4297-9e8a-f1e47c7c4472', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Jour de l''An', '2025-01-01', 'public', 'nationaux', TRUE),
  ('26acfca7-fd11-4e21-91bf-543b162c7a37', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Fête de la Jeunesse', '2025-02-11', 'public', 'nationaux', TRUE),
  ('3578f430-e03d-4582-920c-ae2af63eb63c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Fête de la Femme', '2025-03-08', 'public', 'nationaux', TRUE),
  ('3fbd806d-2fd0-4a83-8cca-8cd024865aad', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Lundi de Pâques', '2025-04-21', 'public', 'nationaux', TRUE),
  ('6bf4c74b-0f3d-4217-a7a9-e358627bea22', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Fête du Travail', '2025-05-01', 'public', 'nationaux', TRUE),
  ('f0282e61-fef9-4e3b-9b59-5bc4dceeb99a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Fête Nationale', '2025-05-20', 'public', 'nationaux', TRUE),
  ('e9816ee5-35b5-4946-8066-eb7ad4398fd0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Ascension', '2025-05-29', 'public', 'nationaux', TRUE),
  ('08a1198a-6b52-42e2-8bd3-b2255eb78060', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Lundi de Pentecôte', '2025-06-09', 'public', 'nationaux', TRUE),
  ('54006e59-148a-4475-b692-0ef2e3a27be3', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Assomption', '2025-08-15', 'public', 'nationaux', TRUE),
  ('8799c944-04c9-478f-adf7-9826158261b0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 'Noël', '2025-12-25', 'public', 'nationaux', TRUE),
  ('64c4e459-6ab0-445c-a774-c268a23ea3ad', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2026, 'Jour de l''An', '2026-01-01', 'public', 'nationaux', TRUE),
  ('affe4cbe-416a-4510-9dde-836aa69a9858', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2026, 'Fête de la Jeunesse', '2026-02-11', 'public', 'nationaux', TRUE),
  ('547410c3-412f-4bc0-ba00-5d6158990e36', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2026, 'Fête du Travail', '2026-05-01', 'public', 'nationaux', TRUE),
  ('7a50e0ad-9962-4178-8d49-68a18afeb723', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2026, 'Fête Nationale', '2026-05-20', 'public', 'nationaux', TRUE);


-- ============================================================
-- SECTION 28: D12 - SOLDE CONGES (20)
-- ============================================================

INSERT INTO public.d12_solde_conges (id, employe_id, tenant_id, type_conge, annee, acquis, pris, solde, report_annee_prec, en_cours, observations) VALUES
  ('cd3ffd5c-17d1-4b4c-8543-a46d238a95dc', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 16, 14, 0, 3, 'Solde annuel pour 2025'),
  ('4ce7f22e-09fe-4e9f-bce5-544e20520f31', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 14, 16, 0, 1, 'Solde annuel pour 2025'),
  ('44666bb2-f430-4050-8622-5104e227b5ae', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maternite', 2025, 11, 7, 4, 0, 4, 'Solde maternite pour 2025'),
  ('754f1461-bc24-4810-87cc-586eb2926635', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 17, 13, 0, 3, 'Solde annuel pour 2025'),
  ('9b9fc2cd-120a-4018-8ddc-f49b0e35174c', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sans_solde', 2025, 9, 5, 4, 0, 0, 'Solde sans_solde pour 2025'),
  ('ea94bbd6-b4f3-4e28-826b-65743ad56d2d', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', 2025, 9, 0, 9, 0, 5, 'Solde maladie pour 2025'),
  ('0f0dc006-09c5-492d-be36-1095127b1b04', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 18, 12, 0, 0, 'Solde annuel pour 2025'),
  ('526b2a49-fd52-453d-929b-1b1c6e9e1819', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 13, 17, 0, 2, 'Solde annuel pour 2025'),
  ('c0aedc44-2191-43ea-bd30-d529c7dd1ba1', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sans_solde', 2025, 6, 4, 2, 0, 0, 'Solde sans_solde pour 2025'),
  ('0c64600a-6fe5-424c-98fb-68a10a29546b', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 15, 15, 0, 0, 'Solde annuel pour 2025'),
  ('7063922d-5727-4fe0-8f6d-86acca5b7cf6', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 13, 17, 0, 1, 'Solde annuel pour 2025'),
  ('4a03dca2-9a88-4254-82ff-23ea701944c7', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 13, 17, 0, 2, 'Solde annuel pour 2025'),
  ('f6c85761-a7f1-451f-94a7-9aec176f1af0', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', 2025, 12, 6, 6, 0, 3, 'Solde maladie pour 2025'),
  ('da268df1-73a3-4129-ae40-5bfd0ae185a9', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 17, 13, 0, 1, 'Solde annuel pour 2025'),
  ('e33528a5-debc-47cb-8e29-e3cde3ceafd1', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sans_solde', 2025, 10, 0, 10, 0, 1, 'Solde sans_solde pour 2025'),
  ('3dad5c97-8af1-4114-ba61-b890d8b48869', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maternite', 2025, 11, 2, 9, 0, 5, 'Solde maternite pour 2025'),
  ('8d858c4a-506b-4170-90b8-a2653248b708', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 0, 30, 0, 0, 'Solde annuel pour 2025'),
  ('c757d5af-0438-45fa-8e6e-ebae3722e50e', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', 2025, 30, 14, 16, 0, 5, 'Solde annuel pour 2025'),
  ('ee8bd978-c2e9-46f3-8e79-207cc070c1a8', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sans_solde', 2025, 13, 6, 7, 0, 4, 'Solde sans_solde pour 2025'),
  ('98700c9a-de95-4733-b304-5fba50d480c9', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', 2025, 8, 1, 7, 0, 3, 'Solde maladie pour 2025');


-- ============================================================
-- SECTION 29: D12 - CONGES (18)
-- ============================================================

INSERT INTO public.d12_conges (id, employe_id, contrat_id, tenant_id, type_conge, date_debut, date_fin, nb_jours_demandes, nb_jours_accordes, statut, approuve_par, motif, date_decision) VALUES
  ('1e9fdbd0-7a3c-4fee-a3e4-ddc56fd40389', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '1f68b09a-af02-4123-814c-e2dcc8af50df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', '2025-06-08', '2025-05-27', 6, 6, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Jean-Pierre Nkoulou', '2025-01-17'),
  ('99ca8fe8-b72b-4343-8d06-4f2fa8c369fc', '65f95479-3f97-4e74-91f7-761f41257843', '3689cb43-f5eb-4eaa-9c9a-55de3ba44e13', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', '2026-03-06', '2025-10-05', 13, 13, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Marie-Claire Tchinda', '2025-04-16'),
  ('32d17119-1e68-4577-918f-21b04a698915', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', 'ce563240-0a54-427e-90d1-a172b9edfcc6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', '2025-04-14', '2026-05-04', 2, 2, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Alain Nganou', '2025-11-03'),
  ('a6224adb-ee6f-49a6-b9c5-12acd50b2f76', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'b85a8eaa-3b53-4ede-984f-ccd57083c961', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnel', '2025-02-19', '2025-03-18', 11, 11, 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Béatrice Eyenga', NULL),
  ('5bf6974b-e319-4531-adb1-a27982ae8000', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '0d734884-8104-428c-b4b8-d6f017a0467c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maternite', '2026-03-26', '2025-09-11', 7, 7, 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Emmanuel Fotso', NULL),
  ('779aacc2-d2d6-4015-8312-ad2352a76e27', 'ebd9079a-f426-4c86-9537-0d839b042e93', 'd19d44fd-0052-4688-bcae-7990ec980414', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maternite', '2025-02-27', '2025-11-24', 13, 13, 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Florence Kamga', NULL),
  ('d38c3896-256a-415a-8e99-dc062c61713f', '1fd4257c-0dd3-4185-a3af-808e4698d422', '9df6a7b6-421d-4ddf-8a3e-fa92618a4511', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maternite', '2025-11-23', '2026-12-21', 4, 4, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Grégoire Ngo Mbeck', '2025-06-14'),
  ('bb570ed3-3e4f-4c0a-94fd-dc815612be8f', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'c00593f6-cfaf-4b34-82e4-20ad9a927cc9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnel', '2025-11-06', '2026-07-19', 4, 4, 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Hélène Mbarga', NULL),
  ('4237e73c-dd4e-4940-843c-43acf914133c', '95575fac-569c-4ce8-baec-a455a421537d', '8377827a-2216-45c6-bb87-e3d9362133f2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2026-02-28', '2025-04-04', 4, 4, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Ibrahim Atangana', '2025-10-13'),
  ('d8753308-000a-44c0-9fe0-9ead70408651', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '5478a178-8606-4eb1-8897-2fa9f8c4b2ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnel', '2025-06-29', '2026-04-14', 10, 10, 'refuse', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Joséphine Ndi', '2025-10-12'),
  ('d1ab7f74-ff21-49f9-9673-60c23f055f0f', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '1cd1da00-6658-4484-b12a-cb2c85d66006', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnel', '2025-02-18', '2026-12-20', 8, 8, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Karl Tchouankeu', '2025-07-15'),
  ('df58c29a-92ea-461f-8b04-67cc54547e15', '0431f18d-1482-40bc-bd49-a749ffa68094', '74c63929-7e77-47ed-a559-9953dff26fd5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sans_solde', '2025-11-23', '2026-03-26', 13, 13, 'refuse', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Léontine Ngassam', '2025-03-18'),
  ('bb44b89f-91a0-4ebd-a032-6efcf166580c', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', 'a685e375-99d5-479b-8718-2844f517c4ac', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maternite', '2026-01-21', '2026-05-31', 5, 5, 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Maurice Nsame', NULL),
  ('ce6a6c51-ca6a-455b-8179-fe251af7c159', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '347dada1-f081-4c0c-9fa7-85ff63756074', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'exceptionnel', '2025-08-19', '2025-06-28', 4, 4, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Nathalie Moukouri', '2025-08-26'),
  ('4f2c79f6-d8bd-4054-92f7-66e2cbe0aff7', '234c72a5-919c-4d02-99c8-9702006db7cd', '90d5b3b7-7d2c-4b8a-82c7-7e7a6cac6ca4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sans_solde', '2025-03-01', '2026-04-03', 15, 15, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Olivier Zang', '2025-10-13'),
  ('01bcf92b-b66b-4ce3-b566-2aff913e945f', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '64f4db72-9d56-4e21-9c81-fb6bf185d6f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'annuel', '2025-05-18', '2025-10-20', 9, 9, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Patricia Eyon', '2025-04-15'),
  ('1e9a6b53-3485-479b-bffa-feb420a33aac', '07f73f09-8fdf-4b80-b108-c86549a98028', '928913bd-d424-4e13-8898-8ba8939d2e11', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-03-22', '2025-05-06', 6, 6, 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Quentin Nkoum', '2025-10-02'),
  ('039182fb-8ca2-4c5d-99c2-e7de767c1dce', '7f16aac0-e821-4e13-9f8e-d59940cda288', 'c6eb3b5a-ac69-4aac-b6d0-c493ea2a4a28', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-07-15', '2026-02-22', 12, 12, 'brouillon', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Demande conge - Rosalie Nkoulou Mbarga', NULL);


-- ============================================================
-- SECTION 30: D12 - ABSENCES (20)
-- ============================================================

INSERT INTO public.d12_absences (id, employe_id, tenant_id, type_absence, date_debut, nb_jours, justificatif, statut_justification, statut_traitement, date_reprise) VALUES
  ('0d58647f-cb68-4344-a9f7-798d9605ace9', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'non_justifiee', '2025-02-10', 2, 'Certificat medical', 'justifiee', 'traitee', '2025-08-02'),
  ('cefe70b7-75c6-4565-aec2-644eae572f74', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'familiale', '2025-11-07', 1, 'Certificat medical', 'justifiee', 'en_cours', '2025-05-01'),
  ('00d1d258-fd36-4432-9dc8-fb1754de9b53', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'non_justifiee', '2026-05-06', 4, NULL, 'justifiee', 'traitee', '2025-09-03'),
  ('1131dfd9-693f-467e-a717-7475538bc252', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'force_majeure', '2025-11-26', 5, NULL, 'en_attente', 'en_cours', '2026-01-03'),
  ('5a7dc171-691f-483f-99fc-5fe37bff5b54', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'familiale', '2025-09-25', 6, NULL, 'en_attente', 'traitee', '2025-04-11'),
  ('aabaf8f4-aae9-498a-bd46-e085ab00f0a8', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'non_justifiee', '2026-04-26', 6, 'Certificat medical', 'non_justifiee', 'traitee', '2026-02-28'),
  ('dcb7a525-b37f-41c6-952f-31cd5e32c5ba', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-08-15', 3, 'Certificat medical', 'non_justifiee', 'en_cours', '2026-03-04'),
  ('1cb64f10-21bd-45b4-8a97-8cec277d4604', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'familiale', '2025-06-06', 4, 'Justification ecrite', 'justifiee', 'traitee', '2025-09-09'),
  ('f9b93731-9f2e-443b-ac04-dbe01af87bbc', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'personnelle', '2025-12-12', 5, NULL, 'en_attente', 'traitee', '2025-06-22'),
  ('54b7678c-15f0-43a7-8ef9-f273477fd4bd', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'non_justifiee', '2025-12-27', 3, 'Certificat medical', 'en_attente', 'traitee', '2025-03-02'),
  ('7dab995b-0b08-4af4-9eaa-a890bd50815f', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'force_majeure', '2025-02-04', 2, NULL, 'justifiee', 'traitee', '2026-02-27'),
  ('6d82f788-9eaf-4543-affb-89faca237060', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-08-25', 2, NULL, 'justifiee', 'traitee', '2025-08-12'),
  ('e0c291be-16c1-4212-825a-cac82d652775', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'force_majeure', '2026-04-12', 6, 'Certificat medical', 'en_attente', 'en_cours', '2026-05-15'),
  ('3424d93b-0e49-41db-85dd-c52abd1e4f16', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-01-07', 9, NULL, 'en_attente', 'traitee', '2025-01-18'),
  ('c1dc343f-c1a3-4a74-b2f9-4d772a387cab', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'force_majeure', '2025-10-09', 9, 'Justification ecrite', 'justifiee', 'en_cours', '2026-03-17'),
  ('6a501c96-9ffd-4181-93bc-efccae820d30', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-04-20', 2, NULL, 'justifiee', 'traitee', '2025-07-16'),
  ('b2b90cbc-febe-45ca-95ff-bc758ae4dd47', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'force_majeure', '2025-09-16', 6, 'Justification ecrite', 'en_attente', 'traitee', '2026-01-18'),
  ('5f1e789d-c614-42db-95fd-ac4697e6ce0b', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'personnelle', '2026-04-16', 10, 'Certificat medical', 'justifiee', 'traitee', '2025-03-24'),
  ('a1eee4f3-8b1c-4a51-9725-b9fb46cd958e', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'non_justifiee', '2025-02-02', 2, NULL, 'en_attente', 'traitee', '2026-05-03'),
  ('de8876b1-2680-4d37-b374-d772b1112d23', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'maladie', '2025-01-10', 3, 'Certificat medical', 'en_attente', 'traitee', '2025-12-06');


-- ============================================================
-- SECTION 31: D12 - ENTREES/SORTIES (30)
-- ============================================================

INSERT INTO public.d12_entrees_sorties (id, employe_id, tenant_id, sens, date_pointage, heure, mode_pointage, statut, commentaire) VALUES
  ('a98e5365-eeb6-4b31-a0c5-8f4839e076d2', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie_pause', '2025-06-13', '7:14:00', 'badge', 'anormal', NULL),
  ('83e754a7-25b0-4b16-93b3-68ea2d5c7c58', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie', '2025-07-05', '7:59:00', 'badge', 'normal', NULL),
  ('65f8cdce-31da-4bed-81b6-4f6afc9666be', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie_pause', '2025-08-12', '7:11:00', 'manuel', 'normal', NULL),
  ('9aeb577b-dfd0-4000-9a25-28284a4ce608', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-08-15', '7:48:00', 'biometrique', 'normal', NULL),
  ('b7adbc49-834e-4dbe-a892-4a92d9b43159', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-21', '7:36:00', 'biometrique', 'anormal', NULL),
  ('44aa8bf4-7934-48bb-9c9e-345a47e489b9', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-07-20', '7:50:00', 'badge', 'anormal', NULL),
  ('e8c8b688-5f1a-46f5-bf23-f13834e3c1e5', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'retour_pause', '2025-07-15', '7:06:00', 'biometrique', 'normal', NULL),
  ('9f46f179-bbb8-44be-aac0-e796e5aa98c7', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-07-14', '8:49:00', 'manuel', 'normal', NULL),
  ('ec608efa-6a08-4d93-a634-cdbc898f7610', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'retour_pause', '2025-07-05', '8:31:00', 'badge', 'normal', NULL),
  ('5c862042-3d51-4791-9483-2bd10264a834', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie_pause', '2025-07-19', '8:11:00', 'biometrique', 'normal', NULL),
  ('608db497-b5fb-4ef3-81ae-4a80024e12d8', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie_pause', '2025-07-08', '7:45:00', 'badge', 'normal', NULL),
  ('1aa1bc12-8452-4786-a91d-2d9be05d3806', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-20', '8:45:00', 'badge', 'retard', NULL),
  ('934053d8-1c6d-4cf4-b849-31352b518785', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-07-17', '7:05:00', 'badge', 'normal', NULL),
  ('2d63b19e-0368-4263-af23-d8fd463925a0', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie', '2025-07-17', '8:06:00', 'badge', 'normal', NULL),
  ('f2df2471-16a8-441c-aa56-a6d1c5d8606a', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-07-26', '8:35:00', 'biometrique', 'normal', NULL),
  ('fd7ad4db-073f-4632-980c-07eb856ed4a0', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-12', '8:35:00', 'badge', 'anormal', NULL),
  ('1d335471-5826-4ff3-843e-4fc4e28c4ece', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie_pause', '2025-07-12', '8:00:00', 'manuel', 'retard', NULL),
  ('74e0e7d4-fe3b-4a44-a10e-b3401fae38a4', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie', '2025-06-11', '7:36:00', 'badge', 'retard', NULL),
  ('ef3a8189-5c42-4367-9f3f-d08d045b3ab1', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-18', '8:19:00', 'manuel', 'retard', NULL),
  ('64c11873-ba4b-4b85-87f0-0104499bb634', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-09', '7:27:00', 'manuel', 'retard', NULL),
  ('dc0a1797-6b04-4dad-9f54-ba495d48529d', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-08-01', '7:23:00', 'manuel', 'normal', NULL),
  ('644ffb9b-bdc3-4e6a-bae7-5a947412a7dd', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'retour_pause', '2025-08-03', '7:29:00', 'badge', 'normal', NULL),
  ('5c259223-faaa-47bf-b2f8-c051cc865008', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-01', '8:21:00', 'biometrique', 'normal', NULL),
  ('6d7297f1-14ab-47ff-bedf-50b8dc21e39b', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie', '2025-07-13', '8:52:00', 'badge', 'normal', NULL),
  ('5356091b-a557-4928-84f1-23312803b18e', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-06-26', '8:20:00', 'badge', 'retard', NULL),
  ('e3bc9617-c252-4219-ba69-90dcc08fd8ef', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-07-08', '8:36:00', 'badge', 'normal', NULL),
  ('9a1949c1-9746-4240-a85b-437fef5cc11b', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie', '2025-07-06', '8:23:00', 'badge', 'anormal', NULL),
  ('51469cfc-20d5-494f-8c87-9f3faecab346', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'entree', '2025-08-15', '7:43:00', 'badge', 'retard', NULL),
  ('fce419de-eacc-4b57-a82a-1ee1ef5a92c6', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'retour_pause', '2025-06-27', '8:51:00', 'manuel', 'normal', NULL),
  ('6fea7948-0b2a-45c3-98eb-5b03fa012f2e', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'sortie', '2025-08-03', '7:40:00', 'manuel', 'normal', NULL);


-- ============================================================
-- SECTION 32: D12 - AUTORISATIONS (15)
-- ============================================================

INSERT INTO public.d12_autorisations (id, employe_id, tenant_id, type_autorisation, date_debut, nb_heures, motif, statut, approuve_par, date_decision) VALUES
  ('5748cb71-965f-4084-9e8f-7dcde7022bbd', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'absence_heures', '2025-06-07', 7, 'Evenement familial', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-08-18'),
  ('5179157c-043a-4093-8f6d-4a7c512873ad', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permission', '2026-02-15', 7, 'Raison personnelle urgente', 'en_attente', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-26'),
  ('e30f0342-8929-4032-90ce-eeec889d2b2c', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'depart_anticipe', '2025-04-22', 4, 'Rendez-vous administratif', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-11-28'),
  ('eed08d4a-9076-469c-bfba-96ae42ca8b0c', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'depart_anticipe', '2026-02-14', 6, 'Evenement familial', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-01-06'),
  ('c10b2924-f12e-4d20-8105-7b37afddd0e2', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'depart_anticipe', '2025-09-22', 4, 'Probleme de transport', 'refuse', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-07-11'),
  ('acf8f50f-3da4-496e-8770-a487673646fc', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permission', '2026-04-20', 3, 'Rendez-vous administratif', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-09-05'),
  ('eed6aa1d-75a5-4d57-b41d-9c8e54148171', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'depart_anticipe', '2025-10-30', 7, 'Raison personnelle urgente', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-03-14'),
  ('8a56f2e7-75ec-47f6-b346-ce01634b3369', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'absence_heures', '2025-11-16', 6, 'Evenement familial', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-09-24'),
  ('05e046a7-7771-440f-8c75-293e86cc12f1', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permission', '2025-12-23', 8, 'Raison personnelle urgente', 'refuse', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-23'),
  ('d99d6585-59e4-41cd-8f80-568a7db69de4', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permission', '2025-11-23', 2, 'Rendez-vous administratif', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-30'),
  ('206bed3d-2a9b-44d5-b682-d2ae91b41afa', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'depart_anticipe', '2025-01-24', 6, 'Raison personnelle urgente', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-05'),
  ('8e01e2e6-9e45-441e-90a5-eea091f58fcd', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'arrivee_retard', '2025-06-13', 6, 'Evenement familial', 'refuse', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-04-29'),
  ('43d40ec7-c08d-42f8-98be-974e27794c44', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'permission', '2025-07-08', 3, 'Evenement familial', 'refuse', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-01-15'),
  ('f6124cbb-83b3-469a-9c0a-38212473666d', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'arrivee_retard', '2026-04-06', 7, 'Evenement familial', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-27'),
  ('bd7a03a8-d46e-4ea5-86b2-c906658cd6fe', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'arrivee_retard', '2025-07-30', 5, 'Raison personnelle urgente', 'approuve', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-10-02');


-- ============================================================
-- SECTION 33: D12 - COMPTEURS ABSENCES (20)
-- ============================================================

INSERT INTO public.d12_compteurs_absences (id, employe_id, tenant_id, annee, nb_absences_justifiees, nb_absences_non_justifiees, nb_retards, nb_depart_anticipes, total_jours_absences) VALUES
  ('8ecfce52-403c-4385-b528-053ac0e8214d', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 1, 5, 2, 6, 7),
  ('a9040181-ab13-4228-a772-6298203fd7d8', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 0, 4, 3, 10, 6),
  ('58374907-75f4-45ef-b569-bea4b91b27be', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 6, 0, 11, 5),
  ('ea48ac39-cb74-40d1-849a-9a8510316541', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 3, 9, 1, 9, 1),
  ('95e2c884-8221-4a07-b19f-df06f610c27b', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 5, 2, 2, 3, 3),
  ('6c248e81-5450-4bed-a9e4-8e13e81df5fe', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 2, 1, 1, 11, 2),
  ('940bde05-c35e-4d13-9927-90bbc0eac301', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 6, 3, 4, 6),
  ('d9cbec49-a9ee-4dbd-b4c9-f5f55ef15709', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 3, 2, 3, 5, 8),
  ('dc253c12-1546-4bdb-963d-e0766e0a4772', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 1, 7, 2, 4, 2),
  ('7f89d605-9341-4f18-a0b5-6557f4c86415', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 2, 7, 0, 11, 0),
  ('d1d14b70-66ba-436a-95cb-eb62e5e9729b', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 3, 2, 1, 12, 8),
  ('0620bc1a-9c13-437d-80a1-dd90d415dfe0', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 10, 3, 13, 7),
  ('fd1f3737-3446-4fb8-afbd-a2b8f060e795', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 3, 7, 3, 5, 1),
  ('212e4bdb-91c6-4852-a06f-16229c576405', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 0, 1, 9, 0),
  ('1d8fe8d4-825b-4706-8d3a-668a802471e1', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 2, 3, 2, 5, 7),
  ('a0ad84a2-8fd3-4ff4-b426-a3c76ddb219f', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 7, 0, 3, 4),
  ('d0665e77-8bc9-4493-9519-ac825e50173e', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 5, 0, 14, 8),
  ('9c9c52c0-23f8-438e-8d80-c44bb25e5a47', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 1, 6, 0, 7, 4),
  ('70e4dd3a-4e04-4bba-8b66-abd4e6916298', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 0, 7, 2, 11, 1),
  ('41dbebc5-bdc2-4297-a5c0-f21a2498a624', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 3, 1, 1, 6, 5);


-- ============================================================
-- SECTION 34: D04 - HORAIRES (5)
-- ============================================================

INSERT INTO public.d04_horaires (id, tenant_id, code, libelle, heure_debut, heure_fin, duree_hebdomadaire, jours_travail, type_horaire, statut, description) VALUES
  ('c99e960a-4b60-4abe-90e1-2565cfada3f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'HOR-STD', 'Horaire Standard', '07:30', '15:30', 40, 'Lundi-Vendredi', 'temps_plein', 'actif', 'Plage horaire horaire standard : 07:30-15:30'),
  ('badbe12a-b098-40ae-a58e-3368f58da544', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'HOR-CONT', 'Horaire Continue', '08:00', '16:00', 40, 'Lundi-Vendredi', 'temps_plein', 'actif', 'Plage horaire horaire continue : 08:00-16:00'),
  ('ab8a567b-f601-4186-bc7f-cd3628672651', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'HOR-PART', 'Horaire Temps Partiel', '08:00', '13:00', 20, 'Lundi-Vendredi', 'temps_partiel', 'actif', 'Plage horaire horaire temps partiel : 08:00-13:00'),
  ('c4338eff-d5ba-4cc8-bf14-16cd38abd594', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'HOR-ROTA', 'Horaire Rotatif', '06:00', '14:00', 40, 'Rotation 2x8', 'rotation', 'actif', 'Plage horaire horaire rotatif : 06:00-14:00'),
  ('17f5782f-4957-4890-9b76-2aa954a02fcc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'HOR-NUIT', 'Horaire de Nuit', '22:00', '06:00', 40, 'Rotation nocturne', 'nuit', 'actif', 'Plage horaire horaire de nuit : 22:00-06:00');


-- ============================================================
-- SECTION 35: D04 - PLANNINGS (15)
-- ============================================================

INSERT INTO public.d04_plannings (id, employe_id, structure_id, tenant_id, mois, type_planning, statut, valide_par, commentaires, heures_prevues, heures_sup_prevues, jours_repos_prevus) VALUES
  ('4318150f-1e85-49e4-9aff-ded08b63031a', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'mensuel', 'brouillon', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Direction Générale - periode standard', 44, 8, 1),
  ('9b797552-fa2a-45f1-8367-f9c38d0808e5', '65f95479-3f97-4e74-91f7-761f41257843', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 'mensuel', 'brouillon', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Direction Administrative - periode standard', 44, 4, 4),
  ('088d5f0a-2f6f-48ac-b815-ab9152990c3d', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 'hebdomadaire', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Service RH - periode standard', 41, 0, 2),
  ('d0b817d3-65f6-467c-9f37-3539974c55a0', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 'hebdomadaire', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Service Comptabilité - periode standard', 38, 2, 5),
  ('5fba8164-2d1f-42d8-b671-e262a835d242', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 'hebdomadaire', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Département Informatique - periode standard', 42, 2, 4),
  ('353725e8-a72f-43aa-aa8a-acce039f485c', 'ebd9079a-f426-4c86-9537-0d839b042e93', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 'mensuel', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Pôle Logistique - periode standard', 41, 7, 0),
  ('0ee7f9df-00dd-46e7-9838-50620a3f8620', '1fd4257c-0dd3-4185-a3af-808e4698d422', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 'hebdomadaire', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Service Commercial - periode standard', 43, 4, 5),
  ('e2a8681a-8e1e-465b-ab8c-e0216054666e', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 'mensuel', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Département Technique - periode standard', 40, 9, 0),
  ('ff4ab602-c469-49dd-8ffe-6a478519b25f', '95575fac-569c-4ce8-baec-a455a421537d', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 'hebdomadaire', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Équipe Qualité - periode standard', 45, 10, 5),
  ('eebc2004-a4c2-4e56-b101-2e4628d21d09', '68d2c030-00f1-4b7a-a310-fd67ed78af78', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 'hebdomadaire', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Service Juridique - periode standard', 38, 6, 1),
  ('648b1a11-370f-4e6e-a468-ebfe8df94942', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 'mensuel', 'brouillon', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Direction Générale - periode standard', 39, 5, 4),
  ('94822a2c-587b-448e-9963-50f84f9cb97d', '0431f18d-1482-40bc-bd49-a749ffa68094', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 'hebdomadaire', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Direction Administrative - periode standard', 40, 10, 0),
  ('ac023774-d984-43ec-859f-6c19ba7956ec', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'hebdomadaire', 'valide', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Service RH - periode standard', 35, 1, 1),
  ('4f160c44-85cc-4b9e-b245-b51362b6a108', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 'mensuel', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Service Comptabilité - periode standard', 41, 3, 5),
  ('829ac8fe-8f28-4ec2-91da-1403e887940c', '234c72a5-919c-4d02-99c8-9702006db7cd', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 'mensuel', 'actif', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'Planning Département Informatique - periode standard', 39, 1, 5);


-- ============================================================
-- SECTION 36: D04 - POINTAGES (40)
-- ============================================================

INSERT INTO public.d04_pointages (id, employe_id, tenant_id, date_pointage, heure_entree, heure_sortie, nb_heures, nb_heures_sup, statut, mode_pointage, etat_validation) VALUES
  ('37969025-e8ba-40a3-a7fd-fe5f9843d12c', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-17', '8:05:00', '16:42:00', 9.31, 0.33, 'retard', 'biometrique', 'confirme'),
  ('6a445d42-0198-4662-8889-319da965324d', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-25', '7:45:00', '15:00:00', 7.93, 0.16, 'depart_anticipe', 'badge', 'conteste'),
  ('593a5da1-a685-4342-8823-d48c1816c6d7', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-02', '7:44:00', '16:52:00', 7.74, 1.72, 'absent', 'badge', 'conteste'),
  ('1b54a9dc-26fb-42b3-a305-e8f7d01547fd', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-10', '7:24:00', '15:46:00', 9.11, 0.21, 'normal', 'biometrique', 'confirme'),
  ('0ab1f8d5-bc67-49be-9356-f98efe082b1a', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-19', '7:41:00', '17:09:00', 7.64, 1.13, 'depart_anticipe', 'badge', 'conteste'),
  ('0593ac18-6f57-4987-a380-607b44fb08f3', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-15', '7:40:00', '17:09:00', 9.34, 1.23, 'retard', 'badge', 'confirme'),
  ('475faa46-252d-4710-a733-4313afc00556', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-13', '7:48:00', '15:37:00', 8.96, 0.7, 'retard', 'biometrique', 'confirme'),
  ('88e2225b-a329-4f19-a0d1-fc6d0f7ccbd8', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-02', '8:41:00', '15:15:00', 8.61, 1.2, 'depart_anticipe', 'biometrique', 'confirme'),
  ('96ea8ead-207d-4f27-bd71-739bd6896778', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-09', '7:33:00', '17:32:00', 7.88, 0.78, 'absent', 'badge', 'confirme'),
  ('23dcee42-ff43-431b-9f69-a14ff1fd185b', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-03', '8:07:00', '15:31:00', 8.78, 0.14, 'normal', 'biometrique', 'en_attente'),
  ('90000ecd-cdc0-4d18-a7db-8c857c274647', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-17', '8:55:00', '17:26:00', 8.23, 1.37, 'retard', 'badge', 'confirme'),
  ('90ed2b01-9c7f-4e62-9d0f-c2e3503e73b8', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-15', '7:00:00', '16:13:00', 7.58, 0.12, 'retard', 'biometrique', 'conteste'),
  ('0fff7490-9307-4bbe-a62a-83fb4079b8fa', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-25', '8:05:00', '17:34:00', 8.58, 0.31, 'normal', 'biometrique', 'confirme'),
  ('53d481d1-b2b6-4bbb-9ff3-d779c1cca8e4', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-05', '7:51:00', '15:34:00', 8.15, 1.17, 'absent', 'badge', 'en_attente'),
  ('92029e5f-b548-4ee0-bf10-64a699719399', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-26', '7:03:00', '15:05:00', 9.35, 0.23, 'depart_anticipe', 'badge', 'en_attente'),
  ('5e7c9c48-d9d1-4cea-bc5c-759e9d55cefa', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-23', '7:00:00', '17:08:00', 8.9, 0.33, 'normal', 'biometrique', 'confirme'),
  ('0cdab01d-5d1a-4d84-88a2-0706251a4509', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-18', '7:47:00', '16:46:00', 9.27, 1.54, 'normal', 'biometrique', 'conteste'),
  ('801bc521-9379-46ac-8599-3f4816f2f415', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-05', '7:16:00', '17:36:00', 8.76, 0.99, 'depart_anticipe', 'biometrique', 'confirme'),
  ('bfc5dcc3-def6-420d-95b3-2c5d70df02ac', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-03', '7:23:00', '15:16:00', 9.05, 1.79, 'absent', 'badge', 'confirme'),
  ('12ecc18f-14c3-4f29-855a-49c2d74eef1d', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-05', '7:02:00', '15:15:00', 7.59, 0.73, 'normal', 'badge', 'confirme'),
  ('8f5f1aa1-063e-4146-a0fc-b92c6c3757d0', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-10', '8:14:00', '16:15:00', 8.33, 1.44, 'normal', 'badge', 'en_attente'),
  ('4b620e6b-4f15-4814-9f3d-6d573afd50d5', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-16', '7:11:00', '15:51:00', 8.53, 0.09, 'retard', 'badge', 'conteste'),
  ('468a44d0-7056-4384-8521-2e764f92adc5', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-07', '8:20:00', '15:35:00', 8.41, 0.74, 'normal', 'biometrique', 'confirme'),
  ('349b5d7d-a747-42df-8411-f3d6044811ad', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-30', '8:37:00', '16:49:00', 9.05, 1.46, 'depart_anticipe', 'badge', 'confirme'),
  ('a424c6f8-f501-4c28-8161-27ac864815bb', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-01', '8:01:00', '15:34:00', 8.19, 1.68, 'normal', 'biometrique', 'confirme'),
  ('783707f4-1cbe-43d4-89f5-c81a255f0c9c', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-19', '8:06:00', '15:33:00', 9.47, 0.84, 'normal', 'badge', 'en_attente'),
  ('5c2d7ddc-b763-4444-8a10-4364f83db258', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-12', '7:58:00', '15:57:00', 9.19, 0.83, 'normal', 'manuel', 'confirme'),
  ('1ea392cb-76da-4006-a2d4-36b4a035f3d3', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-14', '7:32:00', '15:40:00', 9.14, 0.15, 'depart_anticipe', 'badge', 'conteste'),
  ('4282be0b-b2dd-4d63-a1ae-d5883db74f39', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-17', '7:18:00', '16:54:00', 8.13, 1.6, 'absent', 'biometrique', 'en_attente'),
  ('b1f2f6a0-806b-4800-bef0-cf5861d956c7', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-28', '8:14:00', '15:12:00', 7.77, 1.54, 'normal', 'badge', 'confirme'),
  ('f5fe56df-b3ec-4231-87da-a74f418765b5', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-22', '8:29:00', '16:26:00', 7.74, 0.72, 'normal', 'manuel', 'en_attente'),
  ('43b7cb9e-aa9a-404e-9be6-3e71a4da40ed', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-30', '8:54:00', '15:05:00', 7.82, 1.37, 'absent', 'badge', 'confirme'),
  ('11ac0ca8-a0c3-40c3-bc93-0895153bdf9e', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-12', '7:05:00', '17:15:00', 9.44, 0.79, 'normal', 'biometrique', 'en_attente'),
  ('92c4bd60-cf10-4b1b-b294-cf2468366eb0', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-23', '7:25:00', '16:35:00', 9.0, 0.5, 'retard', 'badge', 'confirme'),
  ('345229d9-e1f0-4016-b229-25e26c0a4785', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-16', '7:03:00', '15:08:00', 7.9, 0.8, 'absent', 'badge', 'en_attente'),
  ('b65d4cfe-99e9-4064-bd01-cac75fdb89fa', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-10', '7:04:00', '15:57:00', 8.79, 1.62, 'normal', 'biometrique', 'confirme'),
  ('7a42de1d-fe3a-457d-8b47-8fcfffa7b98a', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-06', '8:03:00', '15:59:00', 8.65, 1.64, 'retard', 'manuel', 'confirme'),
  ('21dbbc7e-1131-4cc1-9644-712c7595b821', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-19', '8:11:00', '16:13:00', 9.32, 0.55, 'retard', 'badge', 'confirme'),
  ('be274b97-84db-4eff-b82b-6685bc03b4e0', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-02', '8:31:00', '16:56:00', 8.6, 0.12, 'normal', 'manuel', 'confirme'),
  ('a7a0fa25-26fd-4980-a9e2-a1918018a3ca', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-24', '7:41:00', '17:15:00', 8.76, 1.6, 'normal', 'manuel', 'en_attente');


-- ============================================================
-- SECTION 37: D04 - COMPTES HEURES (20)
-- ============================================================

INSERT INTO public.d04_comptes_heures (id, employe_id, tenant_id, mois, heures_normales, heures_supplementaires, heures_absences, heures_repos, solde_heures, nb_retards, statut) VALUES
  ('c2f12018-ca5a-4f88-ad40-09ef9cd870f7', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07', 159.06, 12.12, 9.13, 2.51, 149.42, 1, 'en_cours'),
  ('f5ffb934-7474-4835-aa90-77dd2d3dd334', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06', 160.9, 0.73, 8.11, 1.4, 170.43, 3, 'cloture'),
  ('a7a6a21c-9e97-45c8-be4f-fb6bd2a2b754', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06', 166.84, 24.99, 9.74, 0.5, 162.84, 2, 'cloture'),
  ('62da7a54-c20c-4ee8-ac3e-7c4b425a954e', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04', 166.74, 23.7, 5.76, 4.91, 149.42, 1, 'en_cours'),
  ('235a1170-e5b3-4636-91bb-002933ba7cb1', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05', 160.74, 20.16, 6.98, 4.57, 131.41, 2, 'cloture'),
  ('ee5accfe-5ed3-4cf2-80c9-b09d164b8176', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05', 159.71, 4.71, 9.88, 4.41, 154.61, 2, 'en_cours'),
  ('ee1c1268-90c3-4c02-afca-882e0031b5f9', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07', 141.33, 1.4, 6.02, 0.1, 153.9, 2, 'cloture'),
  ('995d955c-dffe-44c2-8f37-9c286971032f', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05', 168.23, 8.52, 1.77, 4.01, 173.41, 0, 'en_cours'),
  ('ff33e5f6-cbe5-4070-b9d8-0a1970729be4', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05', 160.53, 22.93, 7.74, 4.23, 173.03, 0, 'en_cours'),
  ('9d062d05-558c-401d-b9a0-b45c661024cf', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07', 160.51, 8.41, 3.23, 4.88, 166.62, 3, 'cloture'),
  ('a7d2099e-7a58-4371-baaf-5bdc90ae6111', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07', 162.72, 4.36, 9.69, 3.47, 176.44, 2, 'en_cours'),
  ('3c7aab1e-004f-472e-8c4e-6d4f40ce0521', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05', 153.24, 18.35, 2.95, 0.89, 130.09, 3, 'cloture'),
  ('183b1b19-bd96-4abb-be04-9799b5cf86d3', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04', 146.37, 7.96, 8.09, 3.06, 161.98, 0, 'en_cours'),
  ('f57ef12f-60b0-4e81-9836-e0e13ae64ad4', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05', 151.59, 1.95, 3.47, 1.6, 161.81, 0, 'cloture'),
  ('11c3c2f3-f189-4268-9847-9007502cfc00', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06', 155.63, 6.63, 2.5, 0.34, 142.83, 0, 'cloture'),
  ('c177fa74-c7ba-4a0f-9da6-71e3ff09e549', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04', 141.69, 10.96, 4.2, 0.83, 150.7, 3, 'en_cours'),
  ('8c774739-39cc-44a9-9501-6e4813c0a24c', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07', 143.55, 11.99, 8.64, 3.25, 164.36, 1, 'en_cours'),
  ('cf67e408-352a-4fdf-ae3c-64a5498e8e67', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04', 167.97, 0.84, 0.2, 1.31, 135.24, 2, 'en_cours'),
  ('e30370ef-5b5b-4646-b167-43b61184aab4', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07', 145.63, 1.88, 9.42, 4.89, 146.9, 3, 'cloture'),
  ('37b2c46e-bd64-4418-88e9-6771c89cd596', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04', 155.1, 16.34, 6.07, 2.17, 132.68, 2, 'en_cours');


-- ============================================================
-- SECTION 38: D04 - ABSENCES TEMPS (15)
-- ============================================================

INSERT INTO public.d04_absences (id, employe_id, tenant_id, date_debut, nb_jours, type_absence, justification, nb_heures_perdues, statut) VALUES
  ('51f59c39-2e28-4fe4-9f72-77fbd2f2935d', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-14', 4, 'personnel', 'non_justifiee', 17.01, 'traitee'),
  ('6a95a40d-6449-4782-8acd-6a674ab53047', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-09', 1, 'force_majeure', 'non_justifiee', 25.59, 'traitee'),
  ('4724f6ff-2fad-4a97-bab2-ef22be146e3a', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-06-07', 1, 'personnel', 'justifiee', 21.68, 'traitee'),
  ('edef3b2d-a8c7-4692-9dd9-e6a5d934758b', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-05-07', 2, 'maladie', 'justifiee', 14.62, 'en_cours'),
  ('3f1f9a8e-d37c-456d-a487-21042f131c32', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-26', 1, 'force_majeure', 'justifiee', 17.87, 'traitee'),
  ('aa250c97-03f7-4aea-be9c-79de24ebed22', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-04-28', 4, 'personnel', 'justifiee', 28.54, 'traitee'),
  ('fba341b8-e799-413e-be77-a1f9c73a26f3', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-09', 3, 'force_majeure', 'justifiee', 13.97, 'traitee'),
  ('aea0e2a9-0935-4fcc-9a98-9dc257f749aa', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-27', 4, 'force_majeure', 'justifiee', 15.24, 'traitee'),
  ('71e770e5-37bd-4ac8-9a32-cc34c199ed7c', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-03-05', 2, 'maladie', 'justifiee', 29.38, 'en_cours'),
  ('31763550-599d-4694-b153-284af94e56a6', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-02-28', 5, 'conge', 'non_justifiee', 9.95, 'traitee'),
  ('3891f3f5-c2da-4aae-bcd6-0d0cbadc0887', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-03-05', 5, 'force_majeure', 'non_justifiee', 36.21, 'traitee'),
  ('11a67f53-4d63-481c-adb8-29f221375501', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-11-03', 1, 'force_majeure', 'non_justifiee', 9.11, 'en_cours'),
  ('45fbdbbc-ae18-48cb-99b5-bca866204fe4', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-31', 1, 'force_majeure', 'justifiee', 38.37, 'traitee'),
  ('15ae0732-613c-4b53-bf46-45807c9e0421', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-05', 2, 'conge', 'justifiee', 21.55, 'en_cours'),
  ('fb8e59a7-2535-4551-bc69-96577450ee85', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-03-22', 2, 'conge', 'non_justifiee', 16.25, 'en_cours');


-- ============================================================
-- SECTION 39: D04 - JOURS OUVRABLES (12)
-- ============================================================

INSERT INTO public.d04_jours_ouvrables (id, tenant_id, annee, mois, jours_ouvres, jours_calendaires, jours_feries, statut) VALUES
  ('7d826546-ffe9-429d-8eaa-8262638f059c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 1, 20, 21, 1, 'provisoire'),
  ('9da03600-f810-4f57-a6fa-022f6ec6dfbe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 2, 23, 23, 1, 'provisoire'),
  ('d95d7ca8-8386-4c12-a3e3-3a4f15628741', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 3, 23, 21, 2, 'provisoire'),
  ('878515a9-57a0-4094-b0f9-949824c022e9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 4, 23, 21, 1, 'valide'),
  ('207efd9a-a524-4e32-957b-8ca2ec915717', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 5, 21, 21, 0, 'provisoire'),
  ('adc419d8-539f-45da-a590-0fd45ad1678b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 6, 20, 23, 2, 'valide'),
  ('ea8ea92d-7f25-4a68-8c73-c00b23c0dbaa', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 7, 23, 23, 1, 'provisoire'),
  ('35956340-0886-44bd-afc0-07e0c659ce42', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 8, 23, 24, 0, 'valide'),
  ('d8b98068-e661-4650-ae79-c8133f5b5aed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 9, 22, 24, 0, 'provisoire'),
  ('918d5ec9-63cb-4952-ae07-62961485b8a6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 10, 23, 21, 1, 'valide'),
  ('23061fc3-3bde-4122-bbc8-40667da2ae55', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 11, 21, 21, 2, 'valide'),
  ('ac1df544-07e8-46be-ba90-e2ba7c1a198e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 12, 22, 23, 0, 'valide');


-- ============================================================
-- SECTION 40: D04 - EQUILIBRES VP (20)
-- ============================================================

INSERT INTO public.d04_equilibres_vp (id, employe_id, tenant_id, annee, droits_acquis, droits_pris, droits_reportes, solde, statut_equilibre, observations) VALUES
  ('93b965ae-e478-459c-8d84-db1479c2cdf5', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 24, 9, 4, 3, 'equilibre', 'Equilibre VP Jean-Pierre Nkoulou - 2025'),
  ('b34b79ac-bbf0-4dd0-8906-9b7504fc68e6', '65f95479-3f97-4e74-91f7-761f41257843', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 22, 4, 4, 5, 'deficit', 'Equilibre VP Marie-Claire Tchinda - 2025'),
  ('2fb10267-d27b-49af-9b6f-09ee3ffd7604', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 25, 8, 6, 4, 'equilibre', 'Equilibre VP Alain Nganou - 2025'),
  ('896d640a-b423-42da-b0bb-459e786a3f0b', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 21, 14, 3, 3, 'deficit', 'Equilibre VP Béatrice Eyenga - 2025'),
  ('c4236295-c1c4-4dec-a944-c0a08cf7f619', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 26, 1, 8, 1, 'equilibre', 'Equilibre VP Emmanuel Fotso - 2025'),
  ('3a9cde35-476b-43f1-a282-91e90ca3b869', 'ebd9079a-f426-4c86-9537-0d839b042e93', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 24, 12, 2, 4, 'equilibre', 'Equilibre VP Florence Kamga - 2025'),
  ('345b46e8-3551-4eb8-89a0-72ac5cfb21a5', '1fd4257c-0dd3-4185-a3af-808e4698d422', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 20, 6, 3, 0, 'equilibre', 'Equilibre VP Grégoire Ngo Mbeck - 2025'),
  ('44421c99-1019-4098-a3ba-33b2cac58db0', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 16, 14, 0, 2, 'equilibre', 'Equilibre VP Hélène Mbarga - 2025'),
  ('4608c318-72f5-4d7b-bdc1-7dc255f14d47', '95575fac-569c-4ce8-baec-a455a421537d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 23, 11, 7, 4, 'deficit', 'Equilibre VP Ibrahim Atangana - 2025'),
  ('f69885da-a5f4-4c07-a1b7-be36b2e97c7f', '68d2c030-00f1-4b7a-a310-fd67ed78af78', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 18, 0, 3, 2, 'deficit', 'Equilibre VP Joséphine Ndi - 2025'),
  ('05f3229f-1b07-416a-a4e2-ec10fa4fa8de', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 29, 5, 7, 4, 'excedent', 'Equilibre VP Karl Tchouankeu - 2025'),
  ('a560ea32-45bc-43fb-b563-a33ace8b3e7c', '0431f18d-1482-40bc-bd49-a749ffa68094', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 26, 5, 4, 5, 'equilibre', 'Equilibre VP Léontine Ngassam - 2025'),
  ('7a3aee59-d993-4863-8c11-addc5b4b6a18', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 24, 0, 6, 0, 'equilibre', 'Equilibre VP Maurice Nsame - 2025'),
  ('78d61cfd-aeed-4665-a04c-90b1a82d6c4c', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 21, 7, 10, 1, 'equilibre', 'Equilibre VP Nathalie Moukouri - 2025'),
  ('7d7bb3e4-47ef-48ea-a92c-a2f921aaee4f', '234c72a5-919c-4d02-99c8-9702006db7cd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 23, 13, 8, 0, 'equilibre', 'Equilibre VP Olivier Zang - 2025'),
  ('2243e5ea-94f1-4705-944d-f2a938e0ecbb', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 30, 4, 10, 1, 'equilibre', 'Equilibre VP Patricia Eyon - 2025'),
  ('c3a06362-1084-413d-ac6f-0da92464602b', '07f73f09-8fdf-4b80-b108-c86549a98028', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 22, 8, 9, 2, 'excedent', 'Equilibre VP Quentin Nkoum - 2025'),
  ('1ee49ee5-94d6-4cb2-b146-21a1ffbcea9b', '7f16aac0-e821-4e13-9f8e-d59940cda288', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 28, 12, 5, 3, 'excedent', 'Equilibre VP Rosalie Nkoulou Mbarga - 2025'),
  ('6b17979d-d163-4e4c-8fa4-5fa3cf79da6d', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 21, 14, 4, 5, 'deficit', 'Equilibre VP Sylvain Biya''a - 2025'),
  ('c064cdc4-0293-4292-9795-bd9c2fa8341b', 'c384e532-75ff-4c20-b835-e312a56b2acc', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 2025, 18, 0, 8, 5, 'excedent', 'Equilibre VP Thérèse Ngwe - 2025');


-- ============================================================
-- SECTION 41: D21 - REFERENTIEL METIERS (12)
-- ============================================================

INSERT INTO public.d21_referentiel_metiers (id, tenant_id, parent_id, code, libelle, famille_metier, statut, description, niveau_min, niveau_max, nb_postes_presents, nb_competences_requises) VALUES
  ('d2b30ece-33d0-49ab-ab10-a348241895de', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'DIR-001', 'Direction Generale', 'Direction', 'actif', 'Famille Direction - direction generale', 5, 3, 4, 3),
  ('537bdd26-bdfa-4ebe-80ee-05d37962249b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'RH-001', 'Gestion Ressources Humaines', 'Ressources Humaines', 'actif', 'Famille Ressources Humaines - gestion ressources humaines', 1, 2, 2, 3),
  ('ccd6eaa3-754a-45e2-bfe6-516917546b0c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'CP-001', 'Comptabilite et Finance', 'Finance et Comptabilite', 'actif', 'Famille Finance et Comptabilite - comptabilite et finance', 3, 2, 4, 3),
  ('453d1ca3-22c9-4d8c-bd61-2721bd2a42ff', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'INFO-001', 'Informatique et Systemes', 'Informatique', 'actif', 'Famille Informatique - informatique et systemes', 2, 3, 8, 2),
  ('dd1ec1a2-9102-4825-93db-4dbbcc9a00ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'LOG-001', 'Logistique et Approvisionnement', 'Logistique', 'actif', 'Famille Logistique - logistique et approvisionnement', 5, 2, 7, 3),
  ('e9d344cb-cf6c-4019-ba37-1735eb5dfec2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'COM-001', 'Commercial et Ventes', 'Commercial', 'actif', 'Famille Commercial - commercial et ventes', 2, 3, 2, 4),
  ('af7f84d6-1fc3-40a4-a04b-b1d8a2499637', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', NULL, 'ADM-001', 'Administration Generale', 'Administration', 'actif', 'Famille Administration - administration generale', 3, 2, 5, 4),
  ('831f6e29-2cc8-4c18-9de3-c489b23fba7d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '537bdd26-bdfa-4ebe-80ee-05d37962249b', 'TECH-001', 'Technique et Maintenance', 'Technique', 'actif', 'Famille Technique - technique et maintenance', 1, 3, 7, 2),
  ('128d9bf8-02ae-43c1-aa2e-1413028cc664', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '537bdd26-bdfa-4ebe-80ee-05d37962249b', 'PAIE-001', 'Gestion de la Paie', 'Ressources Humaines', 'actif', 'Famille Ressources Humaines - gestion de la paie', 2, 3, 6, 4),
  ('5c53f7bc-2cc6-4f33-b604-4690af7d7271', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '537bdd26-bdfa-4ebe-80ee-05d37962249b', 'REC-001', 'Recrutement et Integration', 'Ressources Humaines', 'actif', 'Famille Ressources Humaines - recrutement et integration', 3, 3, 4, 2),
  ('3652d851-bbc5-4c19-8328-44dc20a1d750', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'd2b30ece-33d0-49ab-ab10-a348241895de', 'QUAL-001', 'Qualite et Conformite', 'Qualite', 'actif', 'Famille Qualite - qualite et conformite', 5, 1, 4, 1),
  ('1e5a1ee5-3392-42ad-955a-b73189a1bee4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'd2b30ece-33d0-49ab-ab10-a348241895de', 'JUR-001', 'Juridique et Conformite', 'Juridique', 'actif', 'Famille Juridique - juridique et conformite', 2, 3, 4, 2);


-- ============================================================
-- SECTION 42: D21 - COMPETENCES (20)
-- ============================================================

INSERT INTO public.d21_competences (id, tenant_id, type, libelle, niveau_requis, description, poids, statut) VALUES
  ('8f56afd7-321c-4fab-835f-353cd4faceae', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Maitrise du pack Office', 'expert', 'Competence technique: maitrise du pack office', 5, 'actif'),
  ('fc628d28-a23d-4fc4-99ba-4ada1ce87553', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Gestion de paie', 'expert', 'Competence technique: gestion de paie', 5, 'actif'),
  ('2dbca864-f25f-4394-8a38-fdd611551f8d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Developpement Web', 'expert', 'Competence technique: developpement web', 4, 'actif'),
  ('2f362ac9-4289-4139-bcf4-a9141970944b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Administration reseau', 'intermediaire', 'Competence technique: administration reseau', 4, 'actif'),
  ('8c83f682-faf7-422c-9da0-f4b2f0070e38', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Comptabilite generale', 'expert', 'Competence technique: comptabilite generale', 5, 'actif'),
  ('40d8eb3d-2ad9-431c-9386-02d73b14808c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Leadership', 'avance', 'Competence comportemental: leadership', 4, 'actif'),
  ('b8b52826-42ba-4e58-82da-ce110ece00d0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Travail d''equipe', 'expert', 'Competence comportemental: travail d''equipe', 5, 'obsolete'),
  ('5eda570a-477b-4971-9526-e599c3e5d387', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Communication', 'avance', 'Competence comportemental: communication', 4, 'actif'),
  ('e15f91cc-2f77-499c-a444-3a8ce6aec653', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Gestion du stress', 'intermediaire', 'Competence comportemental: gestion du stress', 3, 'actif'),
  ('0ac5e0bd-08c4-4322-9ca4-8ffd65073456', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Droit du travail camerounais', 'expert', 'Competence technique: droit du travail camerounais', 5, 'actif'),
  ('eb7d9987-7e05-4ce4-9001-a3e2fe28d30e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Recrutement et selection', 'avance', 'Competence technique: recrutement et selection', 4, 'actif'),
  ('4d1874b0-9d08-4421-b6d7-33a14fc93a87', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Gestion de projet', 'avance', 'Competence technique: gestion de projet', 4, 'obsolete'),
  ('2a2815fa-5f78-4ab4-ad9c-75370de04029', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'SQL et bases de donnees', 'intermediaire', 'Competence technique: sql et bases de donnees', 3, 'actif'),
  ('d46aac8d-1a85-4aa2-88c2-71079b919eb2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Negociation', 'avance', 'Competence comportemental: negociation', 4, 'obsolete'),
  ('b297df71-549b-472c-be48-2c705e23724a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Logistique et approvisionnement', 'intermediaire', 'Competence technique: logistique et approvisionnement', 3, 'actif'),
  ('55bd54e3-2691-4f4e-ab50-46b8f0481d81', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Marketing digital', 'debutant', 'Competence technique: marketing digital', 2, 'actif'),
  ('5a3f97d6-0a2a-41e3-811b-d243245b06a6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Prise de decision', 'avance', 'Competence comportemental: prise de decision', 4, 'obsolete'),
  ('8ec61744-867c-4837-ac6e-dcd036a91fbd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Controle de gestion', 'expert', 'Competence technique: controle de gestion', 5, 'actif'),
  ('2b753769-d9af-4a0f-b7d8-3d9e945c699d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'technique', 'Maintenance informatique', 'intermediaire', 'Competence technique: maintenance informatique', 3, 'actif'),
  ('5e423eec-511c-4996-bd03-2dd26d6827d5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'comportemental', 'Adaptabilite', 'expert', 'Competence comportemental: adaptabilite', 5, 'obsolete');


-- ============================================================
-- SECTION 43: D21 - FICHES POSTE (15)
-- ============================================================

INSERT INTO public.d21_fiches_poste (id, tenant_id, metier_id, titre, code, classification, statut, description, missions_principales, formation_requise, experience_requise, nationalite_requise, structure_rattachement, salaire_min, salaire_max, valide_par, date_validation) VALUES
  ('eb0f2c0d-00a7-4de4-bd92-dba7019306c4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'd2b30ece-33d0-49ab-ab10-a348241895de', 'Directeur Général', 'FP-100', 'D3', 'actif', 'Fiche de poste pour directeur général. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+5 minimum', '2 ans d''experience', 'Camerounais', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 186010, 720050, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-12-16'),
  ('347a2f4e-8d64-4005-938f-6aeca914a9ef', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '537bdd26-bdfa-4ebe-80ee-05d37962249b', 'Chef de Service RH', 'FP-101', 'D1', 'en_revision', 'Fiche de poste pour chef de service rh. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+3 minimum', '7 ans d''experience', 'Tout nationalite', '95877ee1-8af8-4395-a284-fce5f3bba2bb', 197280, 1933560, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-03-23'),
  ('c9867244-48ae-4a53-8663-3435b7c8729b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ccd6eaa3-754a-45e2-bfe6-516917546b0c', 'Comptable Senior', 'FP-102', 'D2', 'actif', 'Fiche de poste pour comptable senior. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+7 minimum', '4 ans d''experience', 'Camerounais', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', 316330, 421660, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-01-05'),
  ('1e23c8c7-0a35-4335-a3d3-5c6fd20187c2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '453d1ca3-22c9-4d8c-bd61-2721bd2a42ff', 'Développeur Full Stack', 'FP-103', 'D2', 'actif', 'Fiche de poste pour développeur full stack. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+3 minimum', '4 ans d''experience', 'Tout nationalite', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', 350400, 632260, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-05-16'),
  ('b25da052-f1fa-4d77-be9a-23bcefc971d0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'dd1ec1a2-9102-4825-93db-4dbbcc9a00ed', 'Agent Administratif', 'FP-104', 'A2', 'actif', 'Fiche de poste pour agent administratif. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+6 minimum', '8 ans d''experience', 'Tout nationalite', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', 262570, 1145980, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-03-15'),
  ('afb39ab5-15b5-4ed4-bf62-80a2a9339219', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'e9d344cb-cf6c-4019-ba37-1735eb5dfec2', 'Gestionnaire de Paie', 'FP-105', 'D2', 'en_revision', 'Fiche de poste pour gestionnaire de paie. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+2 minimum', '2 ans d''experience', 'Tout nationalite', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', 202280, 1832300, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-01-17'),
  ('62101dbb-5bf2-4f98-a871-5b31ca3c1501', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'af7f84d6-1fc3-40a4-a04b-b1d8a2499637', 'Chargé de Recrutement', 'FP-106', 'A1', 'actif', 'Fiche de poste pour chargé de recrutement. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+8 minimum', '10 ans d''experience', 'Camerounais', 'fc560397-f042-4cea-888a-883660af34b9', 154700, 1719240, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-01-05'),
  ('57043f30-9c78-433d-b84a-565f0f6cb19d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '831f6e29-2cc8-4c18-9de3-c489b23fba7d', 'Responsable Logistique', 'FP-107', 'B2', 'actif', 'Fiche de poste pour responsable logistique. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+7 minimum', '7 ans d''experience', 'Camerounais', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', 183800, 515390, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-01-27'),
  ('a1ffcd4e-6abd-42d7-8c23-588bec0de616', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '128d9bf8-02ae-43c1-aa2e-1413028cc664', 'Contrôleur de Gestion', 'FP-108', 'D3', 'actif', 'Fiche de poste pour contrôleur de gestion. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+3 minimum', '3 ans d''experience', 'Camerounais', 'b19c7184-cf7a-47db-8d13-246a0132ffed', 228170, 909910, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-04-11'),
  ('df574522-a144-4e7e-83a0-0768e7c5bb18', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '5c53f7bc-2cc6-4f33-b604-4690af7d7271', 'Assistante de Direction', 'FP-109', 'D3', 'actif', 'Fiche de poste pour assistante de direction. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+5 minimum', '4 ans d''experience', 'Camerounais', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', 386290, 1327980, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-01-02'),
  ('c150a426-134b-40a4-9022-7aa4c11c0f07', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '3652d851-bbc5-4c19-8328-44dc20a1d750', 'Technicien Maintenance', 'FP-110', 'B2', 'actif', 'Fiche de poste pour technicien maintenance. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+8 minimum', '8 ans d''experience', 'Camerounais', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 209880, 770440, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-05-14'),
  ('1a447751-ba98-4995-a941-043914c8d8ce', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '1e5a1ee5-3392-42ad-955a-b73189a1bee4', 'Chef de Projet IT', 'FP-111', 'B2', 'actif', 'Fiche de poste pour chef de projet it. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+6 minimum', '10 ans d''experience', 'Camerounais', '95877ee1-8af8-4395-a284-fce5f3bba2bb', 182290, 1068800, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-02-08'),
  ('350266c4-0cf5-4c65-96e5-3916d3510f62', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'd2b30ece-33d0-49ab-ab10-a348241895de', 'Analyste Programmateur', 'FP-112', 'D1', 'actif', 'Fiche de poste pour analyste programmateur. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+8 minimum', '10 ans d''experience', 'Tout nationalite', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', 162740, 1545550, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-02-19'),
  ('1508a61e-a590-4e55-b10b-c03adbcbff82', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '537bdd26-bdfa-4ebe-80ee-05d37962249b', 'Agent de Sécurité', 'FP-113', 'A2', 'actif', 'Fiche de poste pour agent de sécurité. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+2 minimum', '3 ans d''experience', 'Camerounais', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', 266470, 1097450, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-05-06'),
  ('83050500-fe7e-4222-aef5-f897e553e2c8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'ccd6eaa3-754a-45e2-bfe6-516917546b0c', 'Conducteur', 'FP-114', 'D3', 'actif', 'Fiche de poste pour conducteur. Missions et responsabilites associees.', '- Superviser les activites du service
- Gerer les equipes
- Rendre compte a la hierarchie', 'Bac+5 minimum', '4 ans d''experience', 'Camerounais', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', 332240, 1738100, 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-01-10');


-- ============================================================
-- SECTION 44: D21 - POSTE COMPETENCE (40)
-- ============================================================

INSERT INTO public.d21_poste_competence (id, fiche_poste_id, competence_id, exigence, niveau_attendu, pourcentage_evaluation) VALUES
  ('a18265a4-06c6-47df-8b74-b95307d6e0e6', 'eb0f2c0d-00a7-4de4-bd92-dba7019306c4', '8f56afd7-321c-4fab-835f-353cd4faceae', 'recommande', 'expert', 32),
  ('190abc76-18cf-40ff-9d04-0ca3465a0980', '347a2f4e-8d64-4005-938f-6aeca914a9ef', 'fc628d28-a23d-4fc4-99ba-4ada1ce87553', 'recommande', 'intermediaire', 73),
  ('7444219d-5e6c-449f-91be-815708e761e5', 'c9867244-48ae-4a53-8663-3435b7c8729b', '2dbca864-f25f-4394-8a38-fdd611551f8d', 'obligatoire', 'debutant', 56),
  ('47659d33-e7eb-4808-8ea9-c00eded8fe68', '1e23c8c7-0a35-4335-a3d3-5c6fd20187c2', '2f362ac9-4289-4139-bcf4-a9141970944b', 'obligatoire', 'debutant', 83),
  ('84a5e4fd-3c88-4ba3-8f50-74e9299d1f09', 'b25da052-f1fa-4d77-be9a-23bcefc971d0', '8c83f682-faf7-422c-9da0-f4b2f0070e38', 'obligatoire', 'intermediaire', 53),
  ('0b4c08d5-fbb4-4a23-9cd2-ec5887339784', 'afb39ab5-15b5-4ed4-bf62-80a2a9339219', '40d8eb3d-2ad9-431c-9386-02d73b14808c', 'obligatoire', 'avance', 72),
  ('f2376230-2868-4f46-861f-c3fd181996d5', '62101dbb-5bf2-4f98-a871-5b31ca3c1501', 'b8b52826-42ba-4e58-82da-ce110ece00d0', 'recommande', 'intermediaire', 25),
  ('47f83bc1-b180-4c2e-99f1-bddcb3a97d92', '57043f30-9c78-433d-b84a-565f0f6cb19d', '5eda570a-477b-4971-9526-e599c3e5d387', 'optionnelle', 'intermediaire', 81),
  ('22867f2a-0377-474a-8733-c007ee0a990b', 'a1ffcd4e-6abd-42d7-8c23-588bec0de616', 'e15f91cc-2f77-499c-a444-3a8ce6aec653', 'recommande', 'intermediaire', 20),
  ('3940f4d8-2d6d-4976-b108-f3cedef4d213', 'df574522-a144-4e7e-83a0-0768e7c5bb18', '0ac5e0bd-08c4-4322-9ca4-8ffd65073456', 'obligatoire', 'debutant', 34),
  ('05b46971-cf1b-4e05-950c-b361536f436f', 'c150a426-134b-40a4-9022-7aa4c11c0f07', 'eb7d9987-7e05-4ce4-9001-a3e2fe28d30e', 'optionnelle', 'intermediaire', 31),
  ('5c1307c5-afd0-4241-8528-ce263f948b80', '1a447751-ba98-4995-a941-043914c8d8ce', '4d1874b0-9d08-4421-b6d7-33a14fc93a87', 'obligatoire', 'debutant', 52),
  ('7c919dd2-ef05-4d31-8bfe-6a7a000eb526', '350266c4-0cf5-4c65-96e5-3916d3510f62', '2a2815fa-5f78-4ab4-ad9c-75370de04029', 'obligatoire', 'expert', 57),
  ('2ee153c4-b8e4-4ce7-9ba6-3eab8b3fe91e', '1508a61e-a590-4e55-b10b-c03adbcbff82', 'd46aac8d-1a85-4aa2-88c2-71079b919eb2', 'recommande', 'expert', 26),
  ('0ede3b7c-9cfe-4de8-8bb9-ee915051e19c', '83050500-fe7e-4222-aef5-f897e553e2c8', 'b297df71-549b-472c-be48-2c705e23724a', 'obligatoire', 'intermediaire', 25),
  ('00ac4041-392e-4fef-b860-11f0a99fa0c5', 'eb0f2c0d-00a7-4de4-bd92-dba7019306c4', '55bd54e3-2691-4f4e-ab50-46b8f0481d81', 'recommande', 'avance', 60),
  ('ae815c3d-b6ff-4cef-8dd4-b88910c47af1', '347a2f4e-8d64-4005-938f-6aeca914a9ef', '5a3f97d6-0a2a-41e3-811b-d243245b06a6', 'optionnelle', 'debutant', 32),
  ('6c4e0f46-90de-4df7-abf2-066b002c7ebb', 'c9867244-48ae-4a53-8663-3435b7c8729b', '8ec61744-867c-4837-ac6e-dcd036a91fbd', 'obligatoire', 'debutant', 37),
  ('8c3ff193-c768-4c13-9b28-0ed8254c7efc', '1e23c8c7-0a35-4335-a3d3-5c6fd20187c2', '2b753769-d9af-4a0f-b7d8-3d9e945c699d', 'obligatoire', 'avance', 65),
  ('1180e962-5e3b-47b3-98fc-dfa7e317bf86', 'b25da052-f1fa-4d77-be9a-23bcefc971d0', '5e423eec-511c-4996-bd03-2dd26d6827d5', 'optionnelle', 'avance', 31),
  ('a5a28023-221b-4b59-ac3b-bf5d6181b264', 'afb39ab5-15b5-4ed4-bf62-80a2a9339219', '8f56afd7-321c-4fab-835f-353cd4faceae', 'recommande', 'avance', 43),
  ('d807c8f2-2d9b-4041-90d5-08ae0244396f', '62101dbb-5bf2-4f98-a871-5b31ca3c1501', 'fc628d28-a23d-4fc4-99ba-4ada1ce87553', 'obligatoire', 'expert', 71),
  ('40dc05b6-2e54-49a1-9ec7-79a0433addb2', '57043f30-9c78-433d-b84a-565f0f6cb19d', '2dbca864-f25f-4394-8a38-fdd611551f8d', 'optionnelle', 'avance', 69),
  ('bb38ce63-8a4a-4151-9fda-6d2ce55e2314', 'a1ffcd4e-6abd-42d7-8c23-588bec0de616', '2f362ac9-4289-4139-bcf4-a9141970944b', 'optionnelle', 'expert', 41),
  ('55e9ab54-b3d2-4b23-9a5e-ae3eac2187d6', 'df574522-a144-4e7e-83a0-0768e7c5bb18', '8c83f682-faf7-422c-9da0-f4b2f0070e38', 'obligatoire', 'intermediaire', 27),
  ('e898db14-30a2-41dc-8dfe-e8755f2bdcba', 'c150a426-134b-40a4-9022-7aa4c11c0f07', '40d8eb3d-2ad9-431c-9386-02d73b14808c', 'obligatoire', 'debutant', 73),
  ('6d9822f4-1ac5-46e0-8f48-d64e5230407f', '1a447751-ba98-4995-a941-043914c8d8ce', 'b8b52826-42ba-4e58-82da-ce110ece00d0', 'optionnelle', 'expert', 43),
  ('36148984-cbfd-4b89-9e0f-47829413259c', '350266c4-0cf5-4c65-96e5-3916d3510f62', '5eda570a-477b-4971-9526-e599c3e5d387', 'optionnelle', 'avance', 98),
  ('0acd44df-f00f-40a0-8183-195ad7c59928', '1508a61e-a590-4e55-b10b-c03adbcbff82', 'e15f91cc-2f77-499c-a444-3a8ce6aec653', 'obligatoire', 'intermediaire', 81),
  ('f33c52f1-1e21-43fa-abc2-581164fff89d', '83050500-fe7e-4222-aef5-f897e553e2c8', '0ac5e0bd-08c4-4322-9ca4-8ffd65073456', 'optionnelle', 'debutant', 72),
  ('3e5aa4b3-a359-4de5-952e-3ddc45def10a', 'eb0f2c0d-00a7-4de4-bd92-dba7019306c4', 'eb7d9987-7e05-4ce4-9001-a3e2fe28d30e', 'optionnelle', 'debutant', 28),
  ('fd40b0b0-6743-4bb4-bebe-4bce1bf87c8d', '347a2f4e-8d64-4005-938f-6aeca914a9ef', '4d1874b0-9d08-4421-b6d7-33a14fc93a87', 'recommande', 'avance', 21),
  ('1330d1b5-d376-4025-97f8-b60ea4ec29de', 'c9867244-48ae-4a53-8663-3435b7c8729b', '2a2815fa-5f78-4ab4-ad9c-75370de04029', 'obligatoire', 'avance', 86),
  ('1b27b1ee-b79a-4737-b001-0655fda8b609', '1e23c8c7-0a35-4335-a3d3-5c6fd20187c2', 'd46aac8d-1a85-4aa2-88c2-71079b919eb2', 'obligatoire', 'expert', 51),
  ('f542e95e-e2b8-45a5-93e4-01316c3d2056', 'b25da052-f1fa-4d77-be9a-23bcefc971d0', 'b297df71-549b-472c-be48-2c705e23724a', 'optionnelle', 'avance', 69),
  ('369f5bc8-41de-4854-be68-973cab29d5e9', 'afb39ab5-15b5-4ed4-bf62-80a2a9339219', '55bd54e3-2691-4f4e-ab50-46b8f0481d81', 'obligatoire', 'debutant', 21),
  ('e4737679-39ec-42c5-a3dd-dddef77ca834', '62101dbb-5bf2-4f98-a871-5b31ca3c1501', '5a3f97d6-0a2a-41e3-811b-d243245b06a6', 'obligatoire', 'expert', 83),
  ('49cbc1c9-a985-4a80-840c-d151db56fc7c', '57043f30-9c78-433d-b84a-565f0f6cb19d', '8ec61744-867c-4837-ac6e-dcd036a91fbd', 'obligatoire', 'debutant', 82),
  ('8c420076-16ee-4f5a-a261-d4f76808901f', 'a1ffcd4e-6abd-42d7-8c23-588bec0de616', '2b753769-d9af-4a0f-b7d8-3d9e945c699d', 'recommande', 'intermediaire', 62),
  ('12308e6c-ec88-46cb-9d03-90f3db51a2fe', 'df574522-a144-4e7e-83a0-0768e7c5bb18', '5e423eec-511c-4996-bd03-2dd26d6827d5', 'recommande', 'debutant', 84);


-- ============================================================
-- SECTION 45: D21 - PASSERELLES (10)
-- ============================================================

INSERT INTO public.d21_passerelles (id, metier_source_id, metier_cible_id, tenant_id, type_passerelle, duree_transition_mois, difficulte, conditions, statut) VALUES
  ('09a8ae6b-fe9c-4e20-8d90-55a46767cc8b', 'd2b30ece-33d0-49ab-ab10-a348241895de', '453d1ca3-22c9-4d8c-bd61-2721bd2a42ff', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'evolution', 23, 'difficile', 'Conditions: formation de 143h et experience de 1 ans', 'actif'),
  ('41ad853f-4da5-49ac-b28d-76a68e9ae90b', '537bdd26-bdfa-4ebe-80ee-05d37962249b', 'dd1ec1a2-9102-4825-93db-4dbbcc9a00ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reconversion', 20, 'difficile', 'Conditions: formation de 62h et experience de 2 ans', 'actif'),
  ('9890d96d-8753-4d9e-945c-598039441ebb', 'ccd6eaa3-754a-45e2-bfe6-516917546b0c', 'e9d344cb-cf6c-4019-ba37-1735eb5dfec2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mobilite', 9, 'difficile', 'Conditions: formation de 44h et experience de 1 ans', 'actif'),
  ('460bbd39-55b1-4827-9f34-4184f8277638', '453d1ca3-22c9-4d8c-bd61-2721bd2a42ff', 'af7f84d6-1fc3-40a4-a04b-b1d8a2499637', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reconversion', 7, 'facilitee', 'Conditions: formation de 63h et experience de 3 ans', 'en_revision'),
  ('1aa642bd-a076-403e-9799-a5a4ef05dba6', 'dd1ec1a2-9102-4825-93db-4dbbcc9a00ed', '831f6e29-2cc8-4c18-9de3-c489b23fba7d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mobilite', 22, 'facilitee', 'Conditions: formation de 156h et experience de 2 ans', 'actif'),
  ('71e80c8f-0f45-4d52-9bac-bff4e2b12208', 'e9d344cb-cf6c-4019-ba37-1735eb5dfec2', '128d9bf8-02ae-43c1-aa2e-1413028cc664', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'evolution', 13, 'difficile', 'Conditions: formation de 124h et experience de 3 ans', 'en_revision'),
  ('e620685b-11a6-425b-9104-e25a0f20f608', 'af7f84d6-1fc3-40a4-a04b-b1d8a2499637', '5c53f7bc-2cc6-4f33-b604-4690af7d7271', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reconversion', 17, 'difficile', 'Conditions: formation de 69h et experience de 1 ans', 'en_revision'),
  ('5710566c-4644-4615-a885-8ff01f506086', '831f6e29-2cc8-4c18-9de3-c489b23fba7d', '3652d851-bbc5-4c19-8328-44dc20a1d750', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'evolution', 6, 'conditionnee', 'Conditions: formation de 130h et experience de 3 ans', 'actif'),
  ('ff1a5d77-a8b0-499e-9eee-4bbf8930dd06', '128d9bf8-02ae-43c1-aa2e-1413028cc664', '1e5a1ee5-3392-42ad-955a-b73189a1bee4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'mobilite', 9, 'facilitee', 'Conditions: formation de 82h et experience de 2 ans', 'actif'),
  ('324c9172-7b89-4b64-a3ba-8b79c071ea3b', '5c53f7bc-2cc6-4f33-b604-4690af7d7271', 'd2b30ece-33d0-49ab-ab10-a348241895de', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'reconversion', 9, 'conditionnee', 'Conditions: formation de 196h et experience de 1 ans', 'actif');


-- ============================================================
-- SECTION 46: D21 - MAPPING (15)
-- ============================================================

INSERT INTO public.d21_referentiel_mapping (id, metier_id, tenant_id, code_employe, poste_actuel, statut, observations) VALUES
  ('8e749352-16ac-44e0-a170-b13c059f6e7b', 'd2b30ece-33d0-49ab-ab10-a348241895de', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1001', 'Directeur Général', 'actif', 'Mapping metier-poste pour directeur général'),
  ('878308cc-03bd-406f-b239-c4586d84705d', '537bdd26-bdfa-4ebe-80ee-05d37962249b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1002', 'Chef de Service RH', 'actif', 'Mapping metier-poste pour chef de service rh'),
  ('bd22f927-e2aa-460b-b0af-f9ba15db3e48', 'ccd6eaa3-754a-45e2-bfe6-516917546b0c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1003', 'Comptable Senior', 'actif', 'Mapping metier-poste pour comptable senior'),
  ('3bf04cbf-ab62-4501-a1cf-2e327a1136fb', '453d1ca3-22c9-4d8c-bd61-2721bd2a42ff', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1004', 'Développeur Full Stack', 'actif', 'Mapping metier-poste pour développeur full stack'),
  ('b533d66c-1d6d-4781-814e-1f5dae1e7464', 'dd1ec1a2-9102-4825-93db-4dbbcc9a00ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1005', 'Agent Administratif', 'actif', 'Mapping metier-poste pour agent administratif'),
  ('b17f9f58-95eb-41d3-9140-22d86784196f', 'e9d344cb-cf6c-4019-ba37-1735eb5dfec2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1006', 'Gestionnaire de Paie', 'en_revision', 'Mapping metier-poste pour gestionnaire de paie'),
  ('bf4c7e1d-5565-488b-bb0e-eb3d890c0e0c', 'af7f84d6-1fc3-40a4-a04b-b1d8a2499637', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1007', 'Chargé de Recrutement', 'actif', 'Mapping metier-poste pour chargé de recrutement'),
  ('2955235d-bd87-49a9-a980-b1b16c126902', '831f6e29-2cc8-4c18-9de3-c489b23fba7d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1008', 'Responsable Logistique', 'actif', 'Mapping metier-poste pour responsable logistique'),
  ('556c6604-4446-4e00-9d32-1cc07ac43495', '128d9bf8-02ae-43c1-aa2e-1413028cc664', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1009', 'Contrôleur de Gestion', 'actif', 'Mapping metier-poste pour contrôleur de gestion'),
  ('556a80bf-dfae-4480-8623-358e535b2155', '5c53f7bc-2cc6-4f33-b604-4690af7d7271', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1010', 'Assistante de Direction', 'actif', 'Mapping metier-poste pour assistante de direction'),
  ('e939d763-25d1-4d1d-9efa-fd4a94a87a2c', '3652d851-bbc5-4c19-8328-44dc20a1d750', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1011', 'Technicien Maintenance', 'en_revision', 'Mapping metier-poste pour technicien maintenance'),
  ('8ed5d93a-aaae-42e2-839a-3d0d840c50f8', '1e5a1ee5-3392-42ad-955a-b73189a1bee4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1012', 'Chef de Projet IT', 'en_revision', 'Mapping metier-poste pour chef de projet it'),
  ('4b1d7dd8-e7a1-4a27-8ade-bc9f8e2ad129', 'd2b30ece-33d0-49ab-ab10-a348241895de', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1013', 'Analyste Programmateur', 'en_revision', 'Mapping metier-poste pour analyste programmateur'),
  ('c39bd388-6a17-4433-a1e4-1b52d2b173dc', '537bdd26-bdfa-4ebe-80ee-05d37962249b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1014', 'Agent de Sécurité', 'actif', 'Mapping metier-poste pour agent de sécurité'),
  ('d103147f-66b7-4395-9593-65484e191d1d', 'ccd6eaa3-754a-45e2-bfe6-516917546b0c', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EMP-1015', 'Conducteur', 'actif', 'Mapping metier-poste pour conducteur');


-- ============================================================
-- SECTION 47: D21 - HISTORIQUE REVISIONS (15)
-- ============================================================

INSERT INTO public.d21_historique_revisions (id, entity_type, entity_id, tenant_id, modifications, revise_par, date_revision) VALUES
  ('b083e544-2fda-4b37-bcb3-765c63ef14ee', 'passerelle', 'eb0f2c0d-00a7-4de4-bd92-dba7019306c4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision passerelle - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-01-05'),
  ('1585099d-9c8f-4c11-9d15-12111c13eea5', 'fiche_poste', '537bdd26-bdfa-4ebe-80ee-05d37962249b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision passerelle - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-06-04'),
  ('d727aae4-5be5-4636-9953-8e85715a5ddd', 'metier', 'c9867244-48ae-4a53-8663-3435b7c8729b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision metier - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-04-16'),
  ('475b4fad-c35e-4715-b1b2-0749f656d557', 'passerelle', '453d1ca3-22c9-4d8c-bd61-2721bd2a42ff', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision passerelle - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-03-04'),
  ('da3b3b27-e4b0-4d4e-83eb-2a7c49462d26', 'metier', 'dd1ec1a2-9102-4825-93db-4dbbcc9a00ed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision passerelle - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-12-17'),
  ('55037ee3-bd20-4073-a187-7a0889c6bda5', 'competence', 'e9d344cb-cf6c-4019-ba37-1735eb5dfec2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision metier - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-05-21'),
  ('96e2971e-5f01-48f2-a80c-608cf733455d', 'passerelle', 'af7f84d6-1fc3-40a4-a04b-b1d8a2499637', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision competence - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-29'),
  ('59c17dc2-0dec-4abc-a25b-8691776464cf', 'metier', '57043f30-9c78-433d-b84a-565f0f6cb19d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision metier - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-10-01'),
  ('e7ec0841-2aa4-4ea0-a149-df0a4c4eb9db', 'competence', '128d9bf8-02ae-43c1-aa2e-1413028cc664', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision metier - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-28'),
  ('46260752-972d-42e2-9d43-3b18854e985b', 'metier', '5c53f7bc-2cc6-4f33-b604-4690af7d7271', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision fiche poste - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-12-26'),
  ('a5098eed-dba3-46f0-b931-a3b9abae5152', 'passerelle', '3652d851-bbc5-4c19-8328-44dc20a1d750', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision competence - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-03-08'),
  ('3c831edc-af1a-4f92-9bd7-4a1d1cf65a83', 'fiche_poste', '1a447751-ba98-4995-a941-043914c8d8ce', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision fiche poste - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-01-25'),
  ('88f24c07-b3ad-45f6-b430-2b4e7e31a9f6', 'metier', '350266c4-0cf5-4c65-96e5-3916d3510f62', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision fiche poste - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2024-07-23'),
  ('ffa6c89d-1c34-4a02-9595-705c3ff6d0e9', 'competence', '1508a61e-a590-4e55-b10b-c03adbcbff82', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision competence - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-11-30'),
  ('9bb78d5a-c306-48ba-a274-4ac69b355c4d', 'competence', '83050500-fe7e-4222-aef5-f897e553e2c8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'Revision fiche poste - Mise a jour criteres', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '2025-12-08');


-- ============================================================
-- SECTION 48: D21 - ECARTS COMPETENCES (25)
-- ============================================================

INSERT INTO public.d21_ecarts_competences (id, employe_id, fiche_poste_id, tenant_id, competence_id, niveau_actuel, niveau_requis, criticite, plan_action, statut) VALUES
  ('b3ced9fa-4c7e-406f-af0a-e7ffa1f3ac16', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', 'eb0f2c0d-00a7-4de4-bd92-dba7019306c4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8f56afd7-321c-4fab-835f-353cd4faceae', 'intermediaire', 'intermediaire', 'faible', 'Formation: coaching', 'planifie'),
  ('bb4ed09c-1d86-48ff-bf77-e8ea9889a93a', '65f95479-3f97-4e74-91f7-761f41257843', '347a2f4e-8d64-4005-938f-6aeca914a9ef', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fc628d28-a23d-4fc4-99ba-4ada1ce87553', 'debutant', 'expert', 'faible', 'Formation: e-learning', 'en_cours'),
  ('aa7af5e6-2f4d-4ccd-b0b8-0238ade439c9', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', 'c9867244-48ae-4a53-8663-3435b7c8729b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2dbca864-f25f-4394-8a38-fdd611551f8d', 'avance', 'expert', 'moyen', 'Formation: certification', 'planifie'),
  ('78aa14dd-9180-4957-91e1-f6a47400cf0a', '6b4be2db-a1e6-495d-a357-af18814f3c3e', '1e23c8c7-0a35-4335-a3d3-5c6fd20187c2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2f362ac9-4289-4139-bcf4-a9141970944b', 'intermediaire', 'avance', 'moyen', 'Formation: certification', 'en_cours'),
  ('797c2b90-37a3-47fb-b09d-2f66628ffb7d', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', 'b25da052-f1fa-4d77-be9a-23bcefc971d0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8c83f682-faf7-422c-9da0-f4b2f0070e38', 'avance', 'avance', 'faible', 'Formation: e-learning', 'en_cours'),
  ('14229e71-b2cf-4c7b-b873-c75319517262', 'ebd9079a-f426-4c86-9537-0d839b042e93', 'afb39ab5-15b5-4ed4-bf62-80a2a9339219', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '40d8eb3d-2ad9-431c-9386-02d73b14808c', 'avance', 'expert', 'moyen', 'Formation: stage', 'non_planifie'),
  ('c8bd535d-58c6-4edd-87eb-dbcd831b6b7e', '1fd4257c-0dd3-4185-a3af-808e4698d422', '62101dbb-5bf2-4f98-a871-5b31ca3c1501', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'b8b52826-42ba-4e58-82da-ce110ece00d0', 'debutant', 'avance', 'critique', 'Formation: stage', 'non_planifie'),
  ('e05c30d7-61d1-454d-8a5f-69f511c8394f', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', '57043f30-9c78-433d-b84a-565f0f6cb19d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '5eda570a-477b-4971-9526-e599c3e5d387', 'debutant', 'intermediaire', 'faible', 'Formation: certification', 'planifie'),
  ('e02f0404-4370-4e62-9789-572a27dbb2c9', '95575fac-569c-4ce8-baec-a455a421537d', 'a1ffcd4e-6abd-42d7-8c23-588bec0de616', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'e15f91cc-2f77-499c-a444-3a8ce6aec653', 'debutant', 'avance', 'moyen', 'Formation: coaching', 'en_cours'),
  ('8ada99ec-5c24-44e1-80f2-56aaeb9d47c1', '68d2c030-00f1-4b7a-a310-fd67ed78af78', 'df574522-a144-4e7e-83a0-0768e7c5bb18', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '0ac5e0bd-08c4-4322-9ca4-8ffd65073456', 'debutant', 'expert', 'moyen', 'Formation: certification', 'planifie'),
  ('2957157c-0df1-4e59-9124-eb3f4fb23542', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', 'c150a426-134b-40a4-9022-7aa4c11c0f07', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'eb7d9987-7e05-4ce4-9001-a3e2fe28d30e', 'intermediaire', 'expert', 'faible', 'Formation: certification', 'en_cours'),
  ('8f7ac543-c93c-4034-97b8-ee78bec19a77', '0431f18d-1482-40bc-bd49-a749ffa68094', '1a447751-ba98-4995-a941-043914c8d8ce', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '4d1874b0-9d08-4421-b6d7-33a14fc93a87', 'intermediaire', 'expert', 'faible', 'Formation: coaching', 'planifie'),
  ('f27eac88-e578-40f1-986b-23ebff53b7c4', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '350266c4-0cf5-4c65-96e5-3916d3510f62', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2a2815fa-5f78-4ab4-ad9c-75370de04029', 'avance', 'expert', 'moyen', 'Formation: certification', 'non_planifie'),
  ('9c63100a-a71d-4478-850b-52aeabf1bd3c', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '1508a61e-a590-4e55-b10b-c03adbcbff82', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'd46aac8d-1a85-4aa2-88c2-71079b919eb2', 'intermediaire', 'expert', 'faible', 'Formation: stage', 'non_planifie'),
  ('10188630-09c6-4c03-a169-d441e2e0c836', '234c72a5-919c-4d02-99c8-9702006db7cd', '83050500-fe7e-4222-aef5-f897e553e2c8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'b297df71-549b-472c-be48-2c705e23724a', 'debutant', 'expert', 'faible', 'Formation: e-learning', 'non_planifie'),
  ('10bb9b71-9a22-4e5a-8f15-daa030ebd2d0', '0571152c-fa2b-47fa-ba90-8708aa485c3f', 'eb0f2c0d-00a7-4de4-bd92-dba7019306c4', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '55bd54e3-2691-4f4e-ab50-46b8f0481d81', 'avance', 'avance', 'faible', 'Formation: coaching', 'en_cours'),
  ('6cd7130b-8d52-4909-88f6-e0a17ef0cfd0', '07f73f09-8fdf-4b80-b108-c86549a98028', '347a2f4e-8d64-4005-938f-6aeca914a9ef', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '5a3f97d6-0a2a-41e3-811b-d243245b06a6', 'debutant', 'expert', 'moyen', 'Formation: coaching', 'planifie'),
  ('03cff9cc-0f99-4b40-b28f-2a79f6a9179c', '7f16aac0-e821-4e13-9f8e-d59940cda288', 'c9867244-48ae-4a53-8663-3435b7c8729b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8ec61744-867c-4837-ac6e-dcd036a91fbd', 'intermediaire', 'intermediaire', 'critique', 'Formation: certification', 'en_cours'),
  ('4a490451-1f8e-4fbd-a4a8-fc20dcb991f1', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', '1e23c8c7-0a35-4335-a3d3-5c6fd20187c2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2b753769-d9af-4a0f-b7d8-3d9e945c699d', 'avance', 'avance', 'critique', 'Formation: stage', 'non_planifie'),
  ('62969f81-0ba1-40b3-9d45-de547d183197', 'c384e532-75ff-4c20-b835-e312a56b2acc', 'b25da052-f1fa-4d77-be9a-23bcefc971d0', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '5e423eec-511c-4996-bd03-2dd26d6827d5', 'avance', 'expert', 'faible', 'Formation: certification', 'non_planifie'),
  ('424f140c-8b01-477c-a55c-7c2e365528f5', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', 'afb39ab5-15b5-4ed4-bf62-80a2a9339219', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8f56afd7-321c-4fab-835f-353cd4faceae', 'intermediaire', 'avance', 'faible', 'Formation: e-learning', 'planifie'),
  ('17fb7d3a-583e-4a04-963a-20040faf5677', '65f95479-3f97-4e74-91f7-761f41257843', '62101dbb-5bf2-4f98-a871-5b31ca3c1501', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fc628d28-a23d-4fc4-99ba-4ada1ce87553', 'avance', 'expert', 'moyen', 'Formation: certification', 'non_planifie'),
  ('46de3164-0614-4b35-9522-0bbbc2b15e0d', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', '57043f30-9c78-433d-b84a-565f0f6cb19d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2dbca864-f25f-4394-8a38-fdd611551f8d', 'intermediaire', 'expert', 'critique', 'Formation: e-learning', 'en_cours'),
  ('13062a7c-117f-4104-a189-bcfc0e814a48', '6b4be2db-a1e6-495d-a357-af18814f3c3e', 'a1ffcd4e-6abd-42d7-8c23-588bec0de616', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2f362ac9-4289-4139-bcf4-a9141970944b', 'intermediaire', 'expert', 'faible', 'Formation: coaching', 'non_planifie'),
  ('d53c881a-7c79-4073-8296-c219082e4680', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', 'df574522-a144-4e7e-83a0-0768e7c5bb18', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8c83f682-faf7-422c-9da0-f4b2f0070e38', 'debutant', 'intermediaire', 'faible', 'Formation: certification', 'non_planifie');


-- ============================================================
-- SECTION 49: D24 - PREVISIONS EFFECTIFS (12)
-- ============================================================

INSERT INTO public.d24_previsions_effectifs (id, structure_id, tenant_id, periode, effectif_prevu, effectif_reel, entrees, sorties, masse_salariale, statut) VALUES
  ('9a92d07f-75c8-460e-ad14-c954d4d3b4ae', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 16, 44, 10, 3, 33468210, 'prevision'),
  ('b84201ce-b129-4b8d-845b-aa99420b017b', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 37, 29, 10, 1, 15318300, 'prevision'),
  ('4ad69f52-706a-4812-a006-4b5d098bb4de', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 48, 23, 0, 1, 9915590, 'prevision'),
  ('ca82a9d0-8530-44d6-b5d1-4a0b95cbc3f0', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 19, 37, 1, 3, 22357570, 'depasse'),
  ('841a4c54-3817-4c31-b05d-4d064e399beb', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 31, 42, 6, 6, 26233530, 'prevision'),
  ('013714f5-51f1-4ded-9980-bb6f5ecc3e59', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 46, 9, 8, 0, 48045150, 'prevision'),
  ('178c3a84-189c-408e-b46a-b6e92ebfb116', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-12-01', 40, 4, 1, 5, 38744820, 'prevision'),
  ('f04dc2b8-64e1-4b72-9a0b-5a504a707825', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 46, 21, 9, 1, 23892320, 'depasse'),
  ('c49cfabd-c93e-4632-8c12-c1bf97f32ae6', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 28, 44, 0, 7, 15490690, 'confirme'),
  ('4028bc3f-20c6-462c-ba3d-5d035b61cb53', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-08-01', 50, 27, 8, 4, 47550080, 'confirme'),
  ('b549272a-de5b-4511-828f-a1c54bd3fbf6', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-01', 46, 43, 5, 0, 42146380, 'confirme'),
  ('f64f70b8-7133-43b4-9205-d9ccc1c94d00', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 5, 2, 9, 6, 41047660, 'prevision');


-- ============================================================
-- SECTION 50: D24 - MOUVEMENTS (20)
-- ============================================================

INSERT INTO public.d24_mouvements_effectifs (id, employe_id, structure_id, tenant_id, date_mouvement, type_mouvement, nature, motif, valide_par, statut) VALUES
  ('54c87e1a-f326-41c7-b418-e4fae4a013f6', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-02-05', 'fin_stage', 'temporaire', 'Mouvement de type licenciement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('c2351ed9-1825-47d2-8865-009ef8e11da8', '65f95479-3f97-4e74-91f7-761f41257843', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-23', 'fin_cdd', 'temporaire', 'Mouvement de type depart volontaire', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('70751b54-fa75-419e-9221-5c1362672666', NULL, '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-09-23', 'fin_cdd', 'definitif', 'Mouvement de type depart volontaire', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('9ce1b831-e8b4-452b-8ce8-559e53dffa9a', NULL, '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-03-29', 'promotion', 'definitif', 'Mouvement de type fin cdd', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'en_attente'),
  ('5e2ca62f-68fe-4821-a96b-e4f9769dfbe2', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-16', 'embauche', 'definitif', 'Mouvement de type fin stage', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('4fbf8207-2166-4ae9-9447-b31b1b4eeb7a', 'ebd9079a-f426-4c86-9537-0d839b042e93', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-07-21', 'fin_stage', 'temporaire', 'Mouvement de type mutation interne', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('2f958d43-0109-480a-b1e8-80073c286e0c', '1fd4257c-0dd3-4185-a3af-808e4698d422', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-11-18', 'fin_stage', 'definitif', 'Mouvement de type embauche', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('344ca472-b2fb-4f7f-b702-bc8060cab9e2', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-07-17', 'licenciement', 'definitif', 'Mouvement de type mutation interne', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('cfb93ddf-ef78-440f-a081-97d023308902', '95575fac-569c-4ce8-baec-a455a421537d', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-11-09', 'fin_stage', 'temporaire', 'Mouvement de type depart volontaire', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'en_attente'),
  ('3b99cc2c-5839-4964-9ffb-ae0dc249b157', '68d2c030-00f1-4b7a-a310-fd67ed78af78', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-04-07', 'licenciement', 'definitif', 'Mouvement de type depart volontaire', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('f050adc8-7eb4-4d6a-bbec-ccb1f361607d', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-03-15', 'depart_volontaire', 'temporaire', 'Mouvement de type fin stage', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'en_attente'),
  ('6b7e49db-8867-49fa-a673-2fdc2dc9b920', '0431f18d-1482-40bc-bd49-a749ffa68094', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-05-10', 'licenciement', 'definitif', 'Mouvement de type fin stage', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'en_attente'),
  ('e3345016-b304-4fb3-82f9-8d4239b7383b', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-05-06', 'mutation_interne', 'definitif', 'Mouvement de type licenciement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('1ee735d6-e047-4d8e-8093-61ba2b2ee9bb', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-04-21', 'depart_volontaire', 'temporaire', 'Mouvement de type promotion', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('9308501c-a149-4eda-a0c4-6b5dc55c9f5a', '234c72a5-919c-4d02-99c8-9702006db7cd', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2026-05-29', 'fin_cdd', 'definitif', 'Mouvement de type promotion', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('f560f67c-5dcd-488d-889a-3541d9947b7d', '0571152c-fa2b-47fa-ba90-8708aa485c3f', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-03', 'embauche', 'temporaire', 'Mouvement de type embauche', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('e2fcf5d4-2084-41ea-adfd-d9304bed4f29', '07f73f09-8fdf-4b80-b108-c86549a98028', 'fc560397-f042-4cea-888a-883660af34b9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-08', 'embauche', 'temporaire', 'Mouvement de type promotion', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('5fe4c70a-eae5-4b2b-9171-c850ffefe8dc', '7f16aac0-e821-4e13-9f8e-d59940cda288', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-08-05', 'embauche', 'temporaire', 'Mouvement de type licenciement', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'en_attente'),
  ('16db9ea9-634f-498f-a22f-b292f378d22e', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-06', 'mutation_interne', 'temporaire', 'Mouvement de type fin cdd', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide'),
  ('adeab1fd-077a-4553-a053-505cba19b937', 'c384e532-75ff-4c20-b835-e312a56b2acc', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2024-08-16', 'fin_cdd', 'temporaire', 'Mouvement de type fin stage', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', 'valide');


-- ============================================================
-- SECTION 51: D24 - TABLEAU BORD SOCIAL (10)
-- ============================================================

INSERT INTO public.d24_tableau_bord_social (id, tenant_id, structure_id, periode, effectif_total, taux_turnover, taux_absenteisme, age_moyen, anciennete_moyenne, ratio_cadre, masse_salariale_totale, masse_salariale_nette, taux_occupation_postes) VALUES
  ('4203636d-cb08-4876-b7c9-38aedb7222c9', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', '2025-04-01', 32, 4, 0, 70, 33, 360, 11421590, 37062040, 99),
  ('99d05b47-5d0a-450d-8a1a-d2eb308b83bb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '95877ee1-8af8-4395-a284-fce5f3bba2bb', '2025-06-01', 13, 4, 1, 80, 20, 250, 86015180, 24622500, 95),
  ('0b68bc4a-44b9-49f0-8e22-676732684ccb', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', '2025-05-01', 5, 1, 3, 40, 14, 280, 59584750, 36409450, 81),
  ('c0808de2-8afd-4514-908c-5451ead2937d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', '2025-06-01', 16, 4, 2, 70, 40, 490, 71021210, 11232730, 81),
  ('165fccd1-b83d-4838-8afe-e2e37241584a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', '2025-06-01', 23, 0, 2, 140, 57, 280, 87662600, 78061430, 98),
  ('eed5e8de-5e6f-4230-ae05-15c8f28388de', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', '2025-04-01', 27, 5, 3, 60, 47, 400, 20447170, 74345320, 88),
  ('85d08f64-7854-4435-93d6-c4d10f42cf9e', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fc560397-f042-4cea-888a-883660af34b9', '2025-05-01', 17, 4, 3, 60, 32, 350, 74707720, 5885530, 96),
  ('7fd638a2-2afb-4c33-952d-b3552e71e5ce', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', '2025-04-01', 31, 1, 1, 20, 42, 400, 47689610, 33389340, 84),
  ('bf6deec7-f4a9-4033-a4a3-bd64fd8f0576', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'b19c7184-cf7a-47db-8d13-246a0132ffed', '2025-04-01', 13, 2, 0, 110, 24, 330, 54322020, 20212060, 95),
  ('b475afd3-7390-40e9-a948-fa580b9876e2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', '2025-06-01', 33, 3, 1, 100, 20, 400, 65149960, 8012660, 87);


-- ============================================================
-- SECTION 52: D24 - DEMOGRAPHIE RH (12)
-- ============================================================

INSERT INTO public.d24_demographie_rh (id, tenant_id, periode, tranche_18_25, tranche_26_35, tranche_36_45, tranche_46_55, tranche_56_65, tranche_plus_65, age_moyen, ratio_hommes_femmes) VALUES
  ('e8d9520d-3ec6-43d8-babe-0921db0aa482', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-01', 28, 51, 5, 2, 30, 52, 260, 48),
  ('f432dd5d-a5c3-40cc-b3df-dafd1afc75e1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 23, 25, 8, 2, 26, 45, 440, 38),
  ('eb0b0935-6992-42ff-91d8-e158652ab294', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-01', 38, 20, 6, 7, 29, 50, 400, 25),
  ('010607a2-afc5-4727-93b3-75fa5d41e6df', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 46, 53, 4, 9, 36, 31, 440, 41),
  ('76285074-5115-4618-81cb-d223b7134b1d', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-07-01', 30, 36, 14, 9, 28, 24, 320, 32),
  ('4f39aaff-e667-4bac-aef8-b181ffca56b2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 28, 21, 0, 3, 26, 52, 380, 46),
  ('613db611-8330-4fe8-ba79-5eebbf1ee7ac', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-04-01', 58, 21, 5, 7, 38, 59, 440, 21),
  ('1e62343c-4fd8-455f-8119-7053c63f09e8', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-01', 25, 45, 4, 9, 27, 20, 450, 33),
  ('b165d934-5efd-4de6-a913-637c629eea7f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 43, 17, 13, 3, 40, 50, 370, 31),
  ('794a46e4-73bc-4e6e-8fdd-cef50f4e48f1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-01', 47, 23, 8, 7, 34, 34, 270, 29),
  ('6ce84ba8-ef1a-4532-9756-1b76ff4ab7db', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-10-01', 36, 27, 0, 0, 28, 53, 280, 36),
  ('0e103411-8f7c-4197-a0cb-2ab32eb13b36', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '2025-01-01', 44, 28, 10, 6, 21, 26, 290, 33);


-- ============================================================
-- SECTION 53: D24 - INDICATEURS (15)
-- ============================================================

INSERT INTO public.d24_indicateurs_effectifs (id, tenant_id, structure_id, nom_indicateur, valeur_actuelle, valeur_cible, statut, periode_mesure, objectif) VALUES
  ('e84f9cae-361e-46a6-8518-1bb829cfd349', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Taux de rotation', 65.16, 25.36, 'critique', '2025-T2', 'Objectif: 86.94%'),
  ('28379f25-c59f-4cd0-b540-f87d77c46faf', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '95877ee1-8af8-4395-a284-fce5f3bba2bb', 'Taux d''absenteisme', 61.19, 99.18, 'faible', '2025-Q2', 'Objectif: 82.4%'),
  ('4fa6f30b-0486-4187-b882-87758a470c2a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', 'Age moyen', 78.38, 48.25, 'moyen', '2025-T2', 'Objectif: 77.61%'),
  ('a16da2d6-ffc1-453e-9ccd-e7f9b4b480a6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', 'Anciennete moyenne', 30.67, 34.44, 'faible', '2025-Q2', 'Objectif: 95.65%'),
  ('0d96d836-bb10-4d19-8ecd-2dcf9f1dd6bd', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', 'Ratio cadres/non-cadres', 65.93, 74.78, 'faible', '2025-Q2', 'Objectif: 73.01%'),
  ('51075f36-d145-45ed-a8ef-afae955bc30b', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '70f311ae-31a8-4694-a71a-1e05ad7f25bf', 'Taux d''occupation', 50.83, 78.61, 'critique', '2025-Q1', 'Objectif: 74.82%'),
  ('11fc1a03-edfb-4e86-be04-74a9fc65e6c1', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fc560397-f042-4cea-888a-883660af34b9', 'Cout moyen par employe', 96.46, 0.53, 'bon', '2025-Q2', 'Objectif: 84.15%'),
  ('123555b3-8aae-4548-b40e-62645d493b33', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a2f68c59-329e-4f08-9c70-617a52fdb5c5', 'Taux de formation', 60.02, 8.81, 'moyen', '2025-Q2', 'Objectif: 81.13%'),
  ('d316a29e-8260-455e-b2a6-709c8dba43f6', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'b19c7184-cf7a-47db-8d13-246a0132ffed', 'Taux de satisfaction', 60.9, 72.45, 'faible', '2025-T1', 'Objectif: 91.35%'),
  ('6c8f01a6-a387-46fd-b8d3-66b4d2e77ec3', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'fe32ee9e-2280-49cb-8d5e-9ad948d55eca', 'Delai moyen de recrutement', 59.75, 94.57, 'bon', '2025-T2', 'Objectif: 83.17%'),
  ('f012b218-132e-474b-8cb8-c2b05c467871', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '6bacdd7e-8553-4d51-8191-c47fcce14e9a', 'Taux de retention', 20.17, 65.69, 'critique', '2025-T1', 'Objectif: 75.84%'),
  ('d44cdad7-5eeb-418e-a655-d3a724482cd2', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '95877ee1-8af8-4395-a284-fce5f3bba2bb', 'Indice de diversite', 78.4, 51.05, 'bon', '2025-Q2', 'Objectif: 90.22%'),
  ('5c70d968-955d-4a28-b496-56cf8a2e0e25', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '8f1ce377-05fc-44c9-a2f0-78ba756979c7', 'Taux de promotion interne', 35.97, 65.5, 'bon', '2025-Q1', 'Objectif: 99.9%'),
  ('a868b43e-6ea7-4598-80c4-31783f8a7f0f', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', '7cf444ce-c0f5-4771-8212-d6e34a3cabbb', 'Cout du turnover', 77.97, 35.31, 'faible', '2025-T2', 'Objectif: 87.58%'),
  ('3256d85e-cfcd-425b-9458-d0af4c09ec3a', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'a37f533e-d4ae-4776-aa0d-7b434b2b47f7', 'Productivite par employe', 51.77, 73.69, 'bon', '2025-Q1', 'Objectif: 86.49%');


-- ============================================================
-- SECTION 54: AUDIT LOGS (20)
-- ============================================================

INSERT INTO public.audit_logs (id, utilisateur_id, tenant_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES
  ('f98d29dc-549c-4080-8c63-2ab54bcccab0', '768a2c7a-6505-4da8-b17c-54aa16e0c144', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EXPORT', 'd21_fiches_poste', '2c3c63de-7a97-4ac8-8b50-1ebc848045fe', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.58', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('ea2c8183-dcf9-431c-9df4-db166681c4db', '768a2c7a-6505-4da8-b17c-54aa16e0c144', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'UPDATE', 'utilisateurs', '65f95479-3f97-4e74-91f7-761f41257843', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('a9624ac1-77a1-4852-8e17-9db6e5276e4c', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'd02_contrats', 'a2abc60b-ff02-4a7e-bcc3-9851e012151a', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.88', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('4ce7bb0f-8da7-4ff2-9a23-dab7cb85c446', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EXPORT', 'd23_structures', '6b4be2db-a1e6-495d-a357-af18814f3c3e', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.148', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('66230c2a-cd3a-45bf-9c9e-41fde91a7c04', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'd24_previsions_effectifs', '3f20159c-a31a-4ad7-a2e4-e51828d28f85', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.194', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('bcc61310-a959-4373-a409-41ef0d63058e', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'utilisateurs', 'ebd9079a-f426-4c86-9537-0d839b042e93', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.124', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('823011b5-fcad-4ee3-a233-fd5a948bd8b1', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DELETE', 'd02_contrats', '1fd4257c-0dd3-4185-a3af-808e4698d422', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.57', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('e6048089-479c-46cb-bc9a-f68c41c6cb02', '768a2c7a-6505-4da8-b17c-54aa16e0c144', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'UPDATE', 'd21_fiches_poste', 'cf0addc5-ec62-4293-90b9-7f00cc98339d', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.138', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('92ef927e-d171-495d-90da-22a648145b7b', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DELETE', 'd12_conges', NULL, NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.192', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('a0134b51-854c-4506-9b36-311d36632705', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'INSERT', 'd05_bulletins_paie', '68d2c030-00f1-4b7a-a310-fd67ed78af78', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.229', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('aca17194-471d-4853-bc7c-1c9953d59231', '768a2c7a-6505-4da8-b17c-54aa16e0c144', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DELETE', 'd05_bulletins_paie', 'bd84bc97-c2e1-418b-8b88-2d0891916df7', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.233', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('ceb57157-cfef-4397-92b1-30b843473b6d', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'd12_conges', NULL, NULL, NULL, '192.168.1.68', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('d305597f-7bc8-44ac-8421-fd85a989347d', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'UPDATE', 'd12_conges', '3bb3fb28-1e79-48b8-a2fb-dbf1981b4538', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.92', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('cea9ca33-94a6-41e7-af20-bae3995eaa3b', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'INSERT', 'd02_contrats', 'c8a51ea6-bc07-498d-8c10-46e5d11782c1', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.170', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('05b1d412-a926-4007-9ffb-757e835c9587', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'EXPORT', 'employes', '234c72a5-919c-4d02-99c8-9702006db7cd', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('6e69a086-1798-46de-ad9d-616444918d21', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DELETE', 'd21_fiches_poste', '0571152c-fa2b-47fa-ba90-8708aa485c3f', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('e5033be0-bfc4-4828-98ee-afcc91415ca9', '768a2c7a-6505-4da8-b17c-54aa16e0c144', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'DELETE', 'utilisateurs', NULL, NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.131', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('854e32c1-a2db-4190-92d9-6e0751e5a007', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'd12_conges', '7f16aac0-e821-4e13-9f8e-d59940cda288', NULL, NULL, '192.168.1.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('00c34e4e-7040-4bc2-bdde-54c7682d490d', '8951e562-1f82-4b1b-b614-a1373bfa0c98', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'employes', '66b90bf6-6ff3-435c-8264-0c6ff874ed52', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.176', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'),
  ('df290eec-adf5-4eb5-a76c-04db4a4dbb0f', 'a434a1c3-cd20-468f-8ce8-7a0e6dee0191', '8fbfb66f-b9d4-4755-96e5-b0e95f96f57b', 'LOGIN', 'd02_contrats', 'c384e532-75ff-4c20-b835-e312a56b2acc', NULL, '{"champ": "statut", "ancien": "en_attente", "nouveau": "actif"}'::jsonb, '192.168.1.177', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0');


-- ============================================================
-- VERIFICATION FINALE
-- ============================================================

SELECT 'tenants' as table_name, COUNT(*) as nb_rows FROM public.tenants UNION ALL
SELECT 'utilisateurs' as table_name, COUNT(*) as nb_rows FROM public.utilisateurs UNION ALL
SELECT 'employes' as table_name, COUNT(*) as nb_rows FROM public.employes UNION ALL
SELECT 'postes' as table_name, COUNT(*) as nb_rows FROM public.postes UNION ALL
SELECT 'd23_structures' as table_name, COUNT(*) as nb_rows FROM public.d23_structures UNION ALL
SELECT 'd23_entites_organisationnelles' as table_name, COUNT(*) as nb_rows FROM public.d23_entites_organisationnelles UNION ALL
SELECT 'd23_nomenclatures' as table_name, COUNT(*) as nb_rows FROM public.d23_nomenclatures UNION ALL
SELECT 'd23_affectations' as table_name, COUNT(*) as nb_rows FROM public.d23_affectations UNION ALL
SELECT 'd23_historique_structures' as table_name, COUNT(*) as nb_rows FROM public.d23_historique_structures UNION ALL
SELECT 'd23_postes_budgetaires' as table_name, COUNT(*) as nb_rows FROM public.d23_postes_budgetaires UNION ALL
SELECT 'd02_contrats' as table_name, COUNT(*) as nb_rows FROM public.d02_contrats UNION ALL
SELECT 'd02_avenants' as table_name, COUNT(*) as nb_rows FROM public.d02_avenants UNION ALL
SELECT 'd02_documents_employe' as table_name, COUNT(*) as nb_rows FROM public.d02_documents_employe UNION ALL
SELECT 'd02_donnees_bancaires' as table_name, COUNT(*) as nb_rows FROM public.d02_donnees_bancaires UNION ALL
SELECT 'd02_mutuelle_prevoyance' as table_name, COUNT(*) as nb_rows FROM public.d02_mutuelle_prevoyance UNION ALL
SELECT 'd02_prets_avances' as table_name, COUNT(*) as nb_rows FROM public.d02_prets_avances UNION ALL
SELECT 'd02_sanctions_disciplinaires' as table_name, COUNT(*) as nb_rows FROM public.d02_sanctions_disciplinaires UNION ALL
SELECT 'd02_visites_medicales' as table_name, COUNT(*) as nb_rows FROM public.d02_visites_medicales UNION ALL
SELECT 'd05_conventions_collectives' as table_name, COUNT(*) as nb_rows FROM public.d05_conventions_collectives UNION ALL
SELECT 'd05_cotisations_sociales' as table_name, COUNT(*) as nb_rows FROM public.d05_cotisations_sociales UNION ALL
SELECT 'd05_elements_paie' as table_name, COUNT(*) as nb_rows FROM public.d05_elements_paie UNION ALL
SELECT 'd05_bulletins_paie' as table_name, COUNT(*) as nb_rows FROM public.d05_bulletins_paie UNION ALL
SELECT 'd05_primes' as table_name, COUNT(*) as nb_rows FROM public.d05_primes UNION ALL
SELECT 'd05_retenues' as table_name, COUNT(*) as nb_rows FROM public.d05_retenues UNION ALL
SELECT 'd05_historique_salaires' as table_name, COUNT(*) as nb_rows FROM public.d05_historique_salaires UNION ALL
SELECT 'd05_previsions_paie' as table_name, COUNT(*) as nb_rows FROM public.d05_previsions_paie UNION ALL
SELECT 'd12_calendrier_jours_feries' as table_name, COUNT(*) as nb_rows FROM public.d12_calendrier_jours_feries UNION ALL
SELECT 'd12_solde_conges' as table_name, COUNT(*) as nb_rows FROM public.d12_solde_conges UNION ALL
SELECT 'd12_conges' as table_name, COUNT(*) as nb_rows FROM public.d12_conges UNION ALL
SELECT 'd12_absences' as table_name, COUNT(*) as nb_rows FROM public.d12_absences UNION ALL
SELECT 'd12_entrees_sorties' as table_name, COUNT(*) as nb_rows FROM public.d12_entrees_sorties UNION ALL
SELECT 'd12_autorisations' as table_name, COUNT(*) as nb_rows FROM public.d12_autorisations UNION ALL
SELECT 'd12_compteurs_absences' as table_name, COUNT(*) as nb_rows FROM public.d12_compteurs_absences UNION ALL
SELECT 'd04_horaires' as table_name, COUNT(*) as nb_rows FROM public.d04_horaires UNION ALL
SELECT 'd04_plannings' as table_name, COUNT(*) as nb_rows FROM public.d04_plannings UNION ALL
SELECT 'd04_pointages' as table_name, COUNT(*) as nb_rows FROM public.d04_pointages UNION ALL
SELECT 'd04_comptes_heures' as table_name, COUNT(*) as nb_rows FROM public.d04_comptes_heures UNION ALL
SELECT 'd04_absences' as table_name, COUNT(*) as nb_rows FROM public.d04_absences UNION ALL
SELECT 'd04_jours_ouvrables' as table_name, COUNT(*) as nb_rows FROM public.d04_jours_ouvrables UNION ALL
SELECT 'd04_equilibres_vp' as table_name, COUNT(*) as nb_rows FROM public.d04_equilibres_vp UNION ALL
SELECT 'd21_referentiel_metiers' as table_name, COUNT(*) as nb_rows FROM public.d21_referentiel_metiers UNION ALL
SELECT 'd21_competences' as table_name, COUNT(*) as nb_rows FROM public.d21_competences UNION ALL
SELECT 'd21_fiches_poste' as table_name, COUNT(*) as nb_rows FROM public.d21_fiches_poste UNION ALL
SELECT 'd21_poste_competence' as table_name, COUNT(*) as nb_rows FROM public.d21_poste_competence UNION ALL
SELECT 'd21_passerelles' as table_name, COUNT(*) as nb_rows FROM public.d21_passerelles UNION ALL
SELECT 'd21_referentiel_mapping' as table_name, COUNT(*) as nb_rows FROM public.d21_referentiel_mapping UNION ALL
SELECT 'd21_historique_revisions' as table_name, COUNT(*) as nb_rows FROM public.d21_historique_revisions UNION ALL
SELECT 'd21_ecarts_competences' as table_name, COUNT(*) as nb_rows FROM public.d21_ecarts_competences UNION ALL
SELECT 'd24_previsions_effectifs' as table_name, COUNT(*) as nb_rows FROM public.d24_previsions_effectifs UNION ALL
SELECT 'd24_mouvements_effectifs' as table_name, COUNT(*) as nb_rows FROM public.d24_mouvements_effectifs UNION ALL
SELECT 'd24_tableau_bord_social' as table_name, COUNT(*) as nb_rows FROM public.d24_tableau_bord_social UNION ALL
SELECT 'd24_demographie_rh' as table_name, COUNT(*) as nb_rows FROM public.d24_demographie_rh UNION ALL
SELECT 'd24_indicateurs_effectifs' as table_name, COUNT(*) as nb_rows FROM public.d24_indicateurs_effectifs UNION ALL
SELECT 'audit_logs' as table_name, COUNT(*) as nb_rows FROM public.audit_logs;

-- Total estime: ~700 lignes de donnees
-- ========================= FIN SEED DATA ==========================