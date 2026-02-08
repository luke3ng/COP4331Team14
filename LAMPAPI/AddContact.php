<?php
    $inData = getRequestInfo();

    $firstName = trim($inData["firstName"] ?? "");
    $lastName  = trim($inData["lastName"] ?? "");
    $phone     = trim($inData["phone"] ?? "");
    $email     = trim($inData["email"] ?? "");
    $userId    = $inData["userId"] ?? 0;

    if ($userId <= 0)
    {
        returnWithError("Missing or invalid userId");
    }
    // input validation
    if ($firstName === "" && $lastName === "" && $phone === "" && $email === "")
    {
        returnWithError("Contact must have at least one field filled out");
    }

    $conn = new mysqli("localhost", "User", "rR32h@1khlL", "COP4331");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }
 
    // Contacts(ID, FirstName, LastName, Phone, Email, UserID)
    $stmt = $conn->prepare("INSERT INTO contacts (UserID, FirstName, LastName, Phone, Email) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt)
    {
        $conn->close();
        returnWithError("Prepare failed");
    }

    $stmt->bind_param("issss", $userId, $firstName, $lastName, $phone, $email);
    if (!$stmt->execute())
    {
        $err = $stmt->error;
        $stmt->close();
        $conn->close();
        returnWithError($err);
    }

    $newId = $conn->insert_id;

    $stmt->close();
    $conn->close();

    returnWithInfo($newId);

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"contactId":0,"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
        exit();
    }

    function returnWithInfo($contactId)
    {
        $retValue = '{"contactId":' . $contactId . ',"error":""}';
        sendResultInfoAsJson($retValue);
        exit();
    }
?>
