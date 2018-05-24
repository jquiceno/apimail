'use strict'

import uuid from 'uuid-base62'
import config from '../../src/config'

module.exports = {
  getNewMessageIn () {
    return {
      recipient: '-hjgsajhbdf@test.pimex.email',
      sender: 'loncuster@gmail.com',
      subject: 'Hola',
      from: 'loncuster <loncuster@gmail.com>',
      'X-Mailgun-Incoming': 'Yes',
      'X-Envelope-From': '<loncuster@gmail.com>',
      Received:
       [ 'from mail-qt0-f179.google.com (mail-qt0-f179.google.com [209.85.216.179]) by mxa.mailgun.org with ESMTP id 5afed242.7f7d373bd4b0-smtp-in-n02; Fri, 18 May 2018 13:16:50 -0000 (UTC)',
         'by mail-qt0-f179.google.com with SMTP id f1-v6so10161711qtj.6        for <-hjgsajhbdf@test.pimex.email>; Fri, 18 May 2018 06:16:48 -0700 (PDT)',
         'from [192.168.0.173] ([181.143.69.179])        by smtp.gmail.com with ESMTPSA id s16-v6sm5772851qks.78.2018.05.18.06.16.46        for <-hjgsajhbdf@test.pimex.email>        (version=TLS1_2 cipher=ECDHE-RSA-AES128-GCM-SHA256 bits=128/128);        Fri, 18 May 2018 06:16:46 -0700 (PDT)' ],
      'Dkim-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed;        d=gmail.com; s=20161025;        h=to:from:subject:message-id:date:user-agent:mime-version         :content-transfer-encoding:content-language;        bh=Et4WjoiWFVy2MwLg1hijTkvQ+1QWPkc1QY/PlDfEc9c=;        b=ufiPQHtchsASVd7SCDc52g0J0ASboHzWPX2gfOiydjs2eoXqLDvV8tmDiozOXeMdyg         J5Kq1/szjRnEk2NGXrL1HdRtXBh+3QOlWsSRzPkij5HxDJcZ+HE9C4sRjC5tbeektAAt         udqDMGac2aypt6C8jHnSJpn1dbAuRbVUkj8qYHqu8cGh4jn175ZjzKSF0CGYYEs+PIIh         1li+4cY2H9XtF+glzhe6ucnCdNNzlxAwYVDQDvTOxN/64/6Vnqe8P6DPp2lIvmkSv+AC         rdW3NzGiFVbE9juJCPG+X6Czf/YkWiUjpm13mLVy4tZihF+SpojOtnCueAziwJsLaknV         lygg==',
      'X-Google-Dkim-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed;        d=1e100.net; s=20161025;        h=x-gm-message-state:to:from:subject:message-id:date:user-agent         :mime-version:content-transfer-encoding:content-language;        bh=Et4WjoiWFVy2MwLg1hijTkvQ+1QWPkc1QY/PlDfEc9c=;        b=TAQOpl7P+fznXX8KVZGdT6qD50yiSX5IWABVdJS1O3UZ2n6k7HgxIbQyAJz85H6EhJ         X6Pn8q32Hf3CAxhIaq4eXfYrE3ow9U5gdNVkYqrtv2hcl0ktP5JTh2/mkC1Zw2wrSOR9         pEsJZUtc09hW2fMiIKrxN3SRQkyYo2KXYIbojUN7TG/cPRjOYh729SvhuqdaZSUzzcvc         5G4GKG/DAT2mRfbbjIx5dndaJakoeQVeU5MKy2Xbct5gDyI1IaXMBAxIMA5Xw4PY/dXb         s0oCD4vtXu6BL1MDE+3YVjS+ofhIahi2toz7sWwPlNOPmFqOCbQtRowUX8yKAWptIbnJ         s5DA==',
      'X-Gm-Message-State': 'ALKqPwe3SX8BfWTA3sXIipNoDGR81jJtrFfekSFeGPwGECVPuEFq6lQJ\tNWG1CUd5SCIAXFACpS/0qDN5b/Ja',
      'X-Google-Smtp-Source': 'AB8JxZokOfS7wnBzJS9pXB/71n67d1kOJCXT7VIO1DwPWIsA+sa+Y3DVWkR4yLfSV3/Dl51q+3JMVg==',
      'X-Received': 'by 2002:ac8:30c8:: with SMTP id w8-v6mr8979351qta.226.1526649407823;        Fri, 18 May 2018 06:16:47 -0700 (PDT)',
      'Return-Path': '<loncuster@gmail.com>',
      To: '-hjgsajhbdf@test.pimex.email',
      From: 'loncuster <loncuster@gmail.com>',
      Subject: 'Hola',
      'Message-Id': '<a69975aa-b491-ca66-78ef-9ee09a7bca25@gmail.com>',
      Date: 'Fri, 18 May 2018 08:16:45 -0500',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Thunderbird/52.7.0',
      'Mime-Version': '1.0',
      'Content-Type': 'text/plain; charset="windows-1252"; format="flowed"',
      'Content-Transfer-Encoding': '7bit',
      'Content-Language': 'en-US',
      'message-headers': '[["X-Mailgun-Incoming", "Yes"], ["X-Envelope-From", "<loncuster@gmail.com>"], ["Received", "from mail-qt0-f179.google.com (mail-qt0-f179.google.com [209.85.216.179]) by mxa.mailgun.org with ESMTP id 5afed242.7f7d373bd4b0-smtp-in-n02; Fri, 18 May 2018 13:16:50 -0000 (UTC)"], ["Received", "by mail-qt0-f179.google.com with SMTP id f1-v6so10161711qtj.6        for <-hjgsajhbdf@test.pimex.email>; Fri, 18 May 2018 06:16:48 -0700 (PDT)"], ["Dkim-Signature", "v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20161025; h=to:from:subject:message-id:date:user-agent:mime-version         :content-transfer-encoding:content-language;        bh=Et4WjoiWFVy2MwLg1hijTkvQ+1QWPkc1QY/PlDfEc9c=;        b=ufiPQHtchsASVd7SCDc52g0J0ASboHzWPX2gfOiydjs2eoXqLDvV8tmDiozOXeMdyg         J5Kq1/szjRnEk2NGXrL1HdRtXBh+3QOlWsSRzPkij5HxDJcZ+HE9C4sRjC5tbeektAAt         udqDMGac2aypt6C8jHnSJpn1dbAuRbVUkj8qYHqu8cGh4jn175ZjzKSF0CGYYEs+PIIh 1li+4cY2H9XtF+glzhe6ucnCdNNzlxAwYVDQDvTOxN/64/6Vnqe8P6DPp2lIvmkSv+AC rdW3NzGiFVbE9juJCPG+X6Czf/YkWiUjpm13mLVy4tZihF+SpojOtnCueAziwJsLaknV         lygg=="], ["X-Google-Dkim-Signature", "v=1; a=rsa-sha256; c=relaxed/relaxed;        d=1e100.net; s=20161025;        h=x-gm-message-state:to:from:subject:message-id:date:user-agent         :mime-version:content-transfer-encoding:content-language; bh=Et4WjoiWFVy2MwLg1hijTkvQ+1QWPkc1QY/PlDfEc9c=; b=TAQOpl7P+fznXX8KVZGdT6qD50yiSX5IWABVdJS1O3UZ2n6k7HgxIbQyAJz85H6EhJ         X6Pn8q32Hf3CAxhIaq4eXfYrE3ow9U5gdNVkYqrtv2hcl0ktP5JTh2/mkC1Zw2wrSOR9         pEsJZUtc09hW2fMiIKrxN3SRQkyYo2KXYIbojUN7TG/cPRjOYh729SvhuqdaZSUzzcvc         5G4GKG/DAT2mRfbbjIx5dndaJakoeQVeU5MKy2Xbct5gDyI1IaXMBAxIMA5Xw4PY/dXb         s0oCD4vtXu6BL1MDE+3YVjS+ofhIahi2toz7sWwPlNOPmFqOCbQtRowUX8yKAWptIbnJ         s5DA=="], ["X-Gm-Message-State", "ALKqPwe3SX8BfWTA3sXIipNoDGR81jJtrFfekSFeGPwGECVPuEFq6lQJ\\tNWG1CUd5SCIAXFACpS/0qDN5b/Ja"], ["X-Google-Smtp-Source", "AB8JxZokOfS7wnBzJS9pXB/71n67d1kOJCXT7VIO1DwPWIsA+sa+Y3DVWkR4yLfSV3/Dl51q+3JMVg=="], ["X-Received", "by 2002:ac8:30c8:: with SMTP id w8-v6mr8979351qta.226.1526649407823;        Fri, 18 May 2018 06:16:47 -0700 (PDT)"], ["Return-Path", "<loncuster@gmail.com>"], ["Received", "from [192.168.0.173] ([181.143.69.179])        by smtp.gmail.com with ESMTPSA id s16-v6sm5772851qks.78.2018.05.18.06.16.46        for <-hjgsajhbdf@test.pimex.email>        (version=TLS1_2 cipher=ECDHE-RSA-AES128-GCM-SHA256 bits=128/128);        Fri, 18 May 2018 06:16:46 -0700 (PDT)"], ["To", "-hjgsajhbdf@test.pimex.email"], ["From", "loncuster <loncuster@gmail.com>"], ["Subject", "Hola"], ["Message-Id", "<a69975aa-b491-ca66-78ef-9ee09a7bca25@gmail.com>"], ["Date", "Fri, 18 May 2018 08:16:45 -0500"], ["User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Thunderbird/52.7.0"], ["Mime-Version", "1.0"], ["Content-Type", "text/plain; charset=\\"windows-1252\\"; format=\\"flowed\\""], ["Content-Transfer-Encoding", "7bit"], ["Content-Language", "en-US"]]',
      timestamp: '1526649411',
      token: '8cec1a724de5124fd1a4091bf1c47c488c28f2a11b72c9df40',
      signature: '077bff631e7641545400b6616a4f4e390db01fe121bd2f3f815505a508b69c96',
      'body-plain': 'Dime que info tienes\r\n',
      'stripped-html': '<p>Dime que info tienes</p>',
      'stripped-text': 'Dime que info tienes',
      'stripped-signature': ''
    }
  },

  getEmailData () {
    return {
      from: `${uuid.v4()}@${config.providers.mailgun.domain}`,
      to: 'jquiceno@pimex.co',
      subject: 'Hello from Mailgun, test support email',
      html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://pimex.co">Click here to add your email address to a mailing list</a>',
      'o:testmode': true
    }
  },

  getEventData (messageId) {
    return {
      opened: {
        timestamp: '1526502523',
        token: 'f13e0dd24906d4d639ade0eaa37205d0b42d260c6103e8dcda',
        signature: 'a780d94aa65ca80bfe1dab9d6e235a95f24b8784fd5cff199ffa1a6d3e0569ed',
        ip: '181.143.69.179',
        city: 'Unknown',
        domain: 'test.pimex.email',
        'message-id': messageId,
        'device-type': 'desktop',
        h: 'be31b7fe5bf076863ac5a383b4af8c80',
        region: 'Unknown',
        'client-name': 'Thunderbird',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Thunderbird/52.7.0',
        'event-timestamp': '1526502523.23',
        'client-os': 'Linux',
        'client-type': 'email client',
        country: 'CO',
        recipient: 'jquiceno@pimex.co',
        event: 'opened',
        'body-plain': ''
      },
      delivered: {
        timestamp: '1526504254',
        token: 'c93a12aba70305da538215a83bf8d3c4938aabf1ddeb232af3',
        signature: '454713a65eee3891eb29841913a41aa141490713a0bde0aa29af0d259b9e7193',
        'X-Mailgun-Sid': 'WyIzM2NmMyIsICJqcXVpY2Vub0BwaW1leC5jbyIsICIwMDhhZTIiXQ==',
        domain: 'test.pimex.email',
        'event-timestamp': '1526504254.81',
        'message-headers': '[["X-Mailgun-Sending-Ip", "209.61.151.224"], ["X-Mailgun-Sid", "WyIzM2NmMyIsICJqcXVpY2Vub0BwaW1leC5jbyIsICIwMDhhZTIiXQ=="], ["Received", "by luna.mailgun.net with HTTP; Wed, 16 May 2018 20:57:33 +0000"], ["Date", "Wed, 16 May 2018 20:57:33 +0000"], ["Sender", "1uhSovoeBpxmbyB6hydw4S=lead.pimex.email@test.pimex.email"], ["Message-Id", "<20180516205733.1.B34CC53483933B56@test.pimex.email>"], ["Pimex-Email-Id", "tPpxFz79EYFeiQdMRuoF"], ["To", "jquiceno@pimex.co"], ["From", "1uhSovoeBpxmbyB6hydw4S@lead.pimex.email"], ["Subject", "Hello from Mailgun, test support email"], ["Content-Type", ["text/html", {"charset": "ascii"}]], ["Mime-Version", "1.0"], ["Content-Transfer-Encoding", ["7bit", {}]]]',
        'Message-Id': `<${messageId}>`,
        recipient: 'jquiceno@pimex.co',
        event: 'delivered',
        'body-plain': ''
      },
      clicked: {
        timestamp: '1526504444',
        token: '2f76b98a7f4402fb43c4017d6ed3c2e7ca716fd244f1846c31',
        signature: 'f1d312fc9bf5d80aafbc9a8cff0c9e1083f695a8698da13c1f7d2cea7a80c086',
        ip: '181.143.69.179',
        city: 'Medellín',
        domain: 'test.pimex.email',
        'message-id': messageId,
        'device-type': 'desktop',
        url: 'http://pimex.co',
        h: '5f7ba054ee9bb62b8e549d4f0c725aa3',
        region: 'ANT',
        'client-name': 'Chromium',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.139 Chrome/66.0.3359.139 Safari/537.36',
        'event-timestamp': '1526504443.93',
        'client-os': 'Linux',
        'client-type': 'browser',
        country: 'CO',
        recipient: 'jquiceno@pimex.co',
        event: 'clicked',
        'body-plain': ''
      }
    }
  }
}
