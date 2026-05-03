CREATE TABLE IF NOT EXISTS warehouse_removal_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cabinet_id VARCHAR(50) NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  reason TEXT NOT NULL,
  requested_by INT NOT NULL,
  requester_role ENUM('manager','store') NOT NULL,
  status ENUM('pending','completed','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (requested_by) REFERENCES users(id),
  INDEX idx_removal_status (status),
  INDEX idx_removal_cabinet_medicine (cabinet_id, medicine_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
