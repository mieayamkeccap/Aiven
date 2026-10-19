ALTER TABLE products
  ADD COLUMN category_id INT NULL AFTER price,
  ADD INDEX idx_products_category_id (category_id),
  ADD CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL;
