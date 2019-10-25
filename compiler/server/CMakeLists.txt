
add_executable (arrp-web-server
    main.cpp
    server.cpp
)

target_link_libraries (arrp-web-server
    PocoFoundation
    PocoNet
    stdc++fs
)

install(TARGETS arrp-web-server DESTINATION server)
