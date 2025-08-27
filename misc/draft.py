Note:
    Có thể input lại để cập nhật lại log (entry log, out log)
    chỉ clear linked EntryExitLog khỏi card khi vừa chuyển từ log out sang log in, log entry nhiều lần thì ghi đè lên lại log entry, log out nhiều lần thì ghi đè lên lại log out
    các khối trong hệ thống nên được chia nhỏ ra ở mức microservice, trong trường hợp cần thiết có thể chuyển đổi ngôn ngữ hoặc build mới dễ dàng hơn

Các khối microservice:
    center device:
        center-server
            trung tâm điều khiển, điều phối hoạt động trong hệ thống
            gửi + phản hồi với gói tin broadcast trong mạng local để hệ thống tự detect

        session-server:
            quản lý session: dùng redis

        center-portal
            website ui để tương tác với người dùng (super user, manager, staff)
            có thể thay thế bằng ngôn ngữ khác nếu cần

    can place inside any device (bao gồm center device):
        device-entry:
            - cài đặt trong bất kỳ thiết bị pc/mini pc nào có liên kết với thiết bị ngoại vi (reader, barrier, camera,...)
            chức năng chính là làm agent đại diện thiết bị kết nối với center-server + session-server (nếu cần auth)
            - gửi + phản hồi với gói tin broadcast trong mạng local để hệ thống tự detect
            - tự động detect các loại device (xem xét triển khai dần)
            - camera-streamer:
                convert luồng stream từ camera để có thể videw lên giao diện
            - giả lập thiết bị (test)
            - có cli đẻ reset lại password

        device-entry-portal:
            website giao diện cho device-entry
            có thể thay thế bằng ngôn ngữ khác nếu cần

DB:
@@ feature
    - snap shot
    - incremental updates + rollback if migrate failed
@@ struct
    - SysParam
        + key
        + value

    - AccountGroup
        + id
        + parentId
        + name

    - Account
        + id
        + name
        + role

    - AccountPassword
        + accountId
        + type
        + salt
        + hash

    - ParkingLot
        + id
        + name
        + description

    - Gate:
        + id
        + parkingLotId
        + name
        + description

    - Card
        + id
        + type
        + uuid
        + currentEntryExitLogId
        () validate() --> true (todo)

    - EntryExitLogSTatus
        + id
        + name

    - EntryExitLog
        + id
        + statusId

    - EntryLog
        + id
        + timestamp
        + gateId
        + logMethodId
        + note

    - EntryLogImage
        + id
        + timestamp
        + entryLogId

    - ExitLog
        + id
        + logId
        + timestamp
        + gateId
        + logMethodId
        + note

    - ExitLogImage
        + id
        + timestamp
        + exitLogId

    - Camera
        + id
        + name
        + type
        + link



Website UI:
    - Gate view:
        + Camera views
        Lanes
            + type: entry / exit
            + inputType:
                -> manually:
                -> card reader
