<?php

	require_once 'config.php';

	$inData = getRequestInfo();

	$conn = getDBConnection(); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		// Check if email already exists
		$stmt = $conn->prepare("SELECT ID FROM users WHERE Email=?");
		$stmt->bind_param("s", $inData["email"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc() )
		{
			returnWithError("Email already exists");
		}
		else
		{
			// Insert new user
			$stmt = $conn->prepare("INSERT INTO users (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)");
			$stmt->bind_param("ssss", $inData["firstname"], $inData["lastname"], $inData["email"], $inData["password"]);
			
			if( $stmt->execute() )
			{
				$newUserId = $conn->insert_id;
				returnWithInfo( $inData["firstname"], $inData["lastname"], $newUserId );
			}
			else
			{
				returnWithError( $stmt->error );
			}
		}

		$stmt->close();
		$conn->close();
	}
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>