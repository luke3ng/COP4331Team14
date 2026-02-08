<?php
    $inData = getRequestInfo();

    $search = trim($inData["search"] ?? "");
    $userId = $inData["userId"] ?? 0;

    if ($userId <= 0)
    {
        returnWithError("Missing or invalid userId");
    }

    // Partial match pattern 
    $q = "%" . $search . "%";

    $conn = new mysqli("localhost", "User", "rR32h@1khlL", "COP4331");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
    }

    // Search multiple fields + enforce per-user isolation
    $stmt = $conn->prepare(
        "SELECT ID, FirstName, LastName, Phone, Email
         FROM contacts
         WHERE UserID = ?
           AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)
         ORDER BY LastName, FirstName
         LIMIT 50"
    );

    if (!$stmt)
    {
        $conn->close();
        returnWithError("Prepare failed");
    }

    $stmt->bind_param("issss", $userId, $q, $q, $q, $q); /// prevents SQLi
    $stmt->execute();

    $result = $stmt->get_result();

    // Build JSON array of contact objects
    $results = [];
    while ($row = $result->fetch_assoc())
    {
        $results[] = [
            "id" => (int)$row["ID"],
            "firstName" => $row["FirstName"],
            "lastName"  => $row["LastName"],
            "phone"     => $row["Phone"],
            "email"     => $row["Email"]
        ];
    }

    $stmt->close();
    $conn->close();

    // Don’t treat “no matches” as an API error - return results: [] and error: "" so the UI can show “No contacts found”
    returnWithResults($results);

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
        $retValue = '{"results":[],"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
        exit();
    }

    function returnWithResults($resultsArray)
    {
        $retValue = json_encode(["results" => $resultsArray, "error" => ""]);
        sendResultInfoAsJson($retValue);
        exit();
    }
?>
