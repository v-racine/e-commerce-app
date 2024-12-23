INSERT INTO admin_users (email, password)
		VALUES('firstTester@testing.com', 'tester1'), ('secondTester@testing.com', 'tester2'), ('thirdTester@testing.com', 'tester3');


INSERT INTO carts (id)
	VALUES(1);

INSERT INTO products (title, price, image)
	VALUES ('Banane', 10.00, 'banane.png');

INSERT INTO products_carts (product_id, cart_id, quantity)
	VALUES(1, 1, 3);
