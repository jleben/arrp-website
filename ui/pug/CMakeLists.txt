
find_program(PUG_PROGRAM pug)

if (PUG_PROGRAM)

    set(pug_sources
        main.pug
        grammar.pug
        pages/doc.pug
        pages/play.pug
        pages/reference.pug
        pages/research.pug
        pages/doc/compiler.pug
        pages/doc/language.pug
        pages/doc/syntax.pug
        pages/doc/target-cpp.pug
    )

    add_custom_command (
        OUTPUT "${CMAKE_BINARY_DIR}/html/play.html"
        COMMAND pug
            "${CMAKE_SOURCE_DIR}/pug/pages"
            -O "{base_url: '${URL_PREFIX}'}"
            --out "${CMAKE_BINARY_DIR}/html"
        DEPENDS ${pug_sources}
        VERBATIM
    )

    add_custom_target(pug_to_html ALL DEPENDS "${CMAKE_BINARY_DIR}/html/play.html")
else()
    message(STATUS "Could not find pug. Pug files will not be processed.")
endif()
