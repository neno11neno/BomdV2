import {
    Container,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
  } from '@mui/material';
  import { useState, useEffect } from 'react';

const linkData = [
    {
        category: '救命',
        links: [
            { name: '104人力銀行', url: 'https://www.104.com.tw/' },
            { name: '1111人力銀行', url: 'https://www.1111.com.tw/' },
            { name: '張老師基金會', url: 'https://www.1980.org.tw/' },
        ],
    },
    {
        category: '企業網路銀行(NCNB/CNB3/XCNB)',
        links: [
            { name: 'PRT(71)', url: 'https://10.16.22.71/tbbportal/' },
            { name: 'PRT(69)', url: 'http://10.16.22.69/tbbportal/' },
            { name: 'E化服務行員入口網站_108', url: 'http://10.16.22.108/TBBEPortal/EmployeeLogin.jsp' },
            { name: 'E化服務行員入口網站_109', url: 'http://10.16.22.109/TBBEPortal/EmployeeLogin.jsp' },
            { name: 'DBBrowser(71)', url: 'http://10.16.22.71/DBBrowser/' },
            { name: 'DBBrowser(69)', url: 'http://10.16.22.69/DBBrowser/' },
            { name: 'NCNB(71)', url: 'http://10.16.22.71/nCNB/' },
            { name: 'NCNB(69)', url: 'http://10.16.22.69/nCNB/' },
            { name: 'CNB3(88)', url: 'http://172.22.11.88/cnb3clientweb/login/breach' },
            { name: 'CNB3(88行員端)', url: ' http://172.22.11.88/cnb3bankweb/a00' },
            { name: 'CNB3(90)', url: 'http://172.22.11.90/cnb3clientweb/login/breach' },
            { name: 'CNB3(90行員端)', url: ' http://172.22.11.90/cnb3bankweb/a00' },
            { name: 'WAS Console(108)', url: 'https://10.16.22.108:9043/ibm/console/' },
            { name: 'WAS Console(109)', url: 'https://10.16.22.109:9043/ibm/console/' },
            { name: 'WAS Console(163)', url: 'https://10.16.22.163:9043/ibm/console/logon.jsp' },
            { name: 'WAS Console(161)', url: 'https://10.16.22.161:9043/ibm/console/logon.jsp' },
            { name: 'WAS Console(71)', url: 'https://10.16.22.71:9043/ibm/console/logon.jsp' },
            { name: 'WAS Console(69)', url: 'https://10.16.22.69:9043/ibm/console/' },
            { name: 'DynaShield XCNB', url: 'https://172.22.11.84/XCNB/LoginTest.jsp' },
        ],
    },
    {
        category: 'Always use',
        links: [
            { name: '公文系統Testing', url: 'http://10.16.22.196/idie/' },
            { name: 'MonitorSP Prime(舊)', url: 'http://210.61.159.9/MSP/' },
            { name: 'MonitorSP Prime(新)', url: ' http://210.61.159.77/MSP/' },
            { name: 'TBB防毒專區', url: ' http://10.10.15.168/#PageTop' },
            { name: 'Checkmarx企業版(新版52)', url: 'https://172.21.11.52/cxwebclient/' },
            { name: 'Checkmarx企業版(新版34)', url: ' http://10.16.22.34/cxwebclient/' },
            { name: '文件管理系統', url: 'http://idie.tbb.com.tw/idie/' },
            { name: '臺灣企銀官網', url: 'http://www.tbb.com.tw/' },
            { name: '數位學習網', url: 'http://elearning.tbb.com.tw/' },
            { name: '個人網路銀行', url: 'https://ebank.tbb.com.tw/nb3/login' },
        ],
    },
    {
        category: 'Production',
        links: [
            { name: 'i-Security 系統管理', url: 'http://10.16.21.31/CMS/adm/index.jsp' },
            { name: 'Portal(客戶)', url: 'https://portal.tbb.com.tw/tbbportal/CustomerLogin.jsp' },
            { name: 'Portal(行員)', url: 'https://eportal.tbb.com.tw/tbbeportal/EmployeeLogin.jsp' },
            { name: '臺灣企銀-入口網站', url: 'https://eportal.tbb.com.tw/tbbeportal/web.html' },
            { name: 'wAF_ACTIVE', url: 'https://10.15.10.244/tmui/login.jsp' },
            { name: 'WAF_STANDBY', url: 'https://10.15.10.243/tmui/login.jsp' },
            { name: '最高權限(簽AD)', url: 'https://eadm.tbb.com.tw/EADM/Logon.aspx' },
            { name: 'N-Reporter管理介面', url: 'https://10.10.15.241/' },
        ],
    },
    {
        category: 'Tool',
        links: [
            { name: 'Unicode字元轉換', url: 'https://www.ifreesite.com/unicode-ascii-ansi.htm' },
            { name: 'Linux鳥哥的學習私房手冊', url: 'http://linux.vbird.org/' },
        ],
    },
    {
        category: 'WebMail',
        links: [
            { name: 'Mail2000', url: 'https://mail.tbb.com.tw/index.html' },
            { name: 'Spam SQR', url: 'http://spam.tbb.com.tw/snspam/spam_request/' },
            { name: 'BIG-IPR - bigip.asm.test.tbb (127.0.0.1)', url: 'https://10.16.22.35/tmui/login.jsp' },
        ],
    },
];
const LinkDirectory = () => {
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState(linkData);
  
    useEffect(() => {
      if (!searchText) {
        setFilteredData(linkData);
        return;
      }
      const lowerSearch = searchText.toLowerCase();
      const newFiltered = linkData
        .map(category => ({
          ...category,
          links: category.links.filter(link =>
            link.name.toLowerCase().includes(lowerSearch) ||
            link.url.toLowerCase().includes(lowerSearch) ||
            (link.account?.toLowerCase().includes(lowerSearch)) ||
            (link.password?.toLowerCase().includes(lowerSearch))
          ),
        }))
        .filter(category => category.links.length > 0);
  
      setFilteredData(newFiltered);
    }, [searchText]);
  
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom fontSize="2rem">
          📚 BookMark
        </Typography>
  
        <TextField
          fullWidth
          variant="outlined"
          placeholder="搜尋名稱、網址、帳號"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ mb: 4 }}
        />
  
        {filteredData.map((category, index) => (
          <Box key={index} sx={{ mb: 5 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {category.category}
            </Typography>
            <List>
              {category.links.map((link, idx) => (
                <ListItem key={idx} component="a" href={link.url} target="_blank" button>
                  <ListItemText
                    primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ fontSize: '0.95rem' }}
                    primary={link.name}
                    secondary={
                      <>
                        {link.url}
                        {link.account && (
                          <>
                            <br />🆔 帳號：{link.account}
                          </>
                        )}
                        {link.password && (
                          <>
                            <br />🔑 密碼：{link.password}
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Container>
    );
  };
  
  export default LinkDirectory;