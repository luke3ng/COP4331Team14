<?php

    require_once 'config.php';

    $inData = getRequestInfo();

    $contactId = $inData["contactId"] ?? 0;
    $userId    = $inData["userId"] ?? 0;
    $firstName = trim($inData["firstName"] ?? "");
    $lastName  = trim($inData["lastName"] ?? "");
    $phone     = trim($inData["phone"] ?? "");
    $email     = trim($inData["email"] ?? "");

    if ($userId <= 0 || $contactId <= 0)
    {
        returnWithError("Missing or invalid userId or contactId");
    }

    // At least one field should be provided for update
    if ($firstName === "" && $lastName === "" && $phone === "" && $email === "")
    {
        returnWithError("At least one field must be provided for update");
    }

    $conn = getDBConnection();
    if ($conn->connect_error)
    {
        returnWithError("DB connect error: " . $conn->connect_error);
    }

    // Update contact using BOTH contactId AND userId
    // This prevents a user from updating another user's contact
    $stmt = $conn->prepare(
        "UPDATE contacts 
         SET FirstName = ?, LastName = ?, Phone = ?, Email = ?
         WHERE ID = ? AND UserID = ?"
    );

    if (!$stmt)
    {
        $conn->close();
        returnWithError("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);

    if (!$stmt->execute())
    {
        $err = $stmt->error;
        $stmt->close();
        $conn->close();
        returnWithError("Execute failed: " . $err);
    }

    // If affected_rows == 0: contact doesn't exist OR belongs to a different user
    if ($stmt->affected_rows === 0)
    {
        $stmt->close();
        $conn->close();
        returnWithError("No contact updated (not found or not authorized)");
    }

    $stmt->close();
    $conn->close();

    sendResultInfoAsJson(json_encode([
        "success" => true,
        "error"   => ""
    ]));
    exit();

    function getRequestInfo()
    {
        return json_decode(file_get_contents("php://input"), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header("Content-Type: application/json");
        echo $obj;
    }

    function returnWithError($err)
    {
        sendResultInfoAsJson(json_encode([
            "success" => false,
            "error"   => $err
        ]));
        exit();
    }
?>
