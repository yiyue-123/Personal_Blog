package com.personal.blog.infra.xss;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class XssFilter {

    public String cleanPlainText(String text) {
        if (text == null) {
            return null;
        }
        return Jsoup.clean(text, Safelist.none());
    }
}
