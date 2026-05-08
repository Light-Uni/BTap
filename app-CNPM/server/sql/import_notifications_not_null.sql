ALTER TABLE import_notifications
  MODIFY medicine_id INT NOT NULL,
  MODIFY quantity INT NOT NULL,
  MODIFY supplier_id INT NOT NULL,
  MODIFY expected_delivery_date DATE NOT NULL,
  MODIFY notified_by INT NOT NULL;
