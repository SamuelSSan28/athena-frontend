import type { NextPage } from 'next'
import {
  Box,
  Center,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  ButtonGroup,
  PopoverTrigger,
  PopoverFooter,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Divider,
  InputGroup,
  InputLeftElement,
  Input,
  WrapItem,
  Avatar,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  chakra,
} from '@chakra-ui/react';
import NextLink from 'next/link'
import { BiKey, BiLogOut } from "react-icons/bi";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
} from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router'
import { useUser } from '../../contexts/UserContext'

const Header: NextPage = () => {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter()
  const pathnames_not_scroll_header = ['/create-contract', '/profile']
  const scroll_ = pathnames_not_scroll_header.indexOf(router.pathname) === -1;
  const [state, setstate] = useState(scroll_ ? true : false)
  const [yPos, setYPos] = useState(0)
  const { isLogged, name, logout } = useUser();


  useEffect(function mount() {

    function onScroll() {
      setYPos(window.pageYOffset);
    }

    window.addEventListener("scroll", onScroll);

    return function unMount() {
      window.removeEventListener("scroll", onScroll);
    };
  });


  return (
    <Box w="100%" >
      <Flex
        as={'header'}
        pos={yPos > 70 && scroll_ ? "fixed" : "relative"}
        top="0"
        w={'full'}
        boxShadow={'sm'}
        zIndex="9999"
        justify={'center'}
        css={{
          backdropFilter: 'saturate(180%) blur(5px)',
          backgroundColor: useColorModeValue(
            'rgba(255, 255, 255, 0.8)',
            'rgba(26, 32, 44, 0.8)'
          ),
        }}
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'4rem'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}>
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}  >

          <Box ml={10}>
            <a href={'/'} >
              <Image src="/logo.png" width="200rem" height="50rem" />
            </a>
          </Box>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>

        </Flex>


        {!isLogged ?
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            marginRight="6rem"
            spacing={6}>

            <Button
              as={'a'}
              fontSize={'md'}
              fontWeight={400}
              variant={'link'}
              href={'/login'}>
              Sign In
            </Button>

            <Button
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'md'}
              fontWeight={600}
              color={'white'}
              bg={'#38b6ff'}
              onClick={(e) => setstate(!state)}
              href={'#'}
              _hover={{
                bg: 'blue.300',
              }}>
              Sign Up
            </Button>
          </Stack>

          :
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            marginRight="6rem"
            spacing={6}>

            <Popover >
              <PopoverTrigger >
                <Button
                  variant="outline"
                  size="lg"
                  fontSize={'md'}
                  fontWeight={400}
                  borderRadius="35px"
                  paddingLeft="0.5rem"

                  _hover={{
                    bg: 'black.300',
                  }}>

                  <WrapItem>
                    <Avatar name={name} bgColor="#38b6ff" size="sm" />
                  </WrapItem>

                  <Text marginRight="0.3rem" marginLeft="0.5rem">7.0000</Text>

                  <Text color="#38b6ff" fontWeight="700" > DSET </Text>

                </Button>
              </PopoverTrigger>

              <PopoverContent w={"16rem"} _focus={{ boxShadow: "none" }} >
                <PopoverArrow />
                <PopoverHeader pt={4} fontWeight="bold" border="0" fontSize={'lg'} color={'gray.800'}>
                  {name}
                </PopoverHeader>
                <PopoverBody display="flex" flexDirection="row">
                  <Text fontWeight={600} color={'gray.500'}>
                    0xc4c16a645...b21a
                  </Text>
                  <BiKey style={{ color: "#1E88E5", fontSize: "1.5em" }} />
                </PopoverBody>
                <Divider orientation="horizontal" />
                <PopoverBody>
                  <Box
                    w={'full'}
                    bg={'white'}

                    rounded={'lg'}

                  >

                    <Stack pt={0} align={'center'}>
                      <Text color={'gray.500'} fontSize={'sm'} textTransform={'uppercase'}>
                        Balance
                      </Text>

                      <Stack direction={'row'} align={'center'}>
                        <Text fontWeight={800} fontSize={'xl'}>
                          4.689 DST
                        </Text>
                      </Stack>

                      <Button
                        variant="outline"
                        size="sm"
                        fontSize={'md'}
                        fontWeight={400}
                        borderRadius="35px"
                        _hover={{
                          bg: 'blue.400',
                          color: "#fff"
                        }}>

                        <Text  >Manage your wallet</Text>

                      </Button>
                    </Stack>
                  </Box>

                </PopoverBody>

                <Divider orientation="horizontal" />
                <NextLink href="/create-contract">
                  <PopoverBody color={'gray.600'} fontWeight="bold" _hover={{ color: "#1E88E5" }} >
                    Create a contract
                  </PopoverBody>
                </NextLink>

                <NextLink href="/create-contract">
                  <PopoverBody color={'gray.600'} fontWeight="bold" _hover={{ color: "#1E88E5" }} >
                    Create a campaign
                  </PopoverBody>
                </NextLink>
                <Divider orientation="horizontal" />
                <NextLink href="/profile">
                  <PopoverBody color={'gray.600'} fontWeight="bold" _hover={{ color: "#1E88E5" }}>
                    Profile
                  </PopoverBody>
                </NextLink>
                <NextLink href="#">
                  <PopoverBody color={'gray.600'} fontWeight="bold" _hover={{ color: "#1E88E5" }} as="a" href="#">
                    CAS History
                  </PopoverBody>
                </NextLink>
                <NextLink href="#">
                  <PopoverBody color={'gray.600'} fontWeight="bold" _hover={{ color: "#1E88E5" }}>
                    Rewards History
                  </PopoverBody>
                </NextLink>
                <Divider orientation="horizontal" />
                <PopoverBody textAlign="left" color={'gray.600'} fontWeight="bold" _hover={{ color: "#1E88E5" }}
                  as="button" onClick={(e) => logout()}>
                  Logout
                </PopoverBody>

              </PopoverContent>
            </Popover>
          </Stack>
        }

      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={2} style={{ alignItems: "center" }} >

      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label} >
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <NextLink href={navItem.href ?? '#'}>
                <Link
                  p={2}
                  fontSize={'md'}
                  fontWeight={500}
                  color={linkColor}
                  _hover={{
                    textDecoration: 'none',
                    color: "blue.400",
                  }}>
                  {navItem.label}
                </Link>
              </NextLink>
            </PopoverTrigger>
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <NextLink href={href ?? '#'}>
      <Link

        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}>
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'blue.500' }}
              fontWeight={500}>
              {label}
            </Text>
            <Text fontSize={'md'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}>
            <Icon color={'blue.500'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Link>
    </NextLink>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={2} onClick={children && onToggle}>
      <Flex
        py={3}
        as={Link}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text
          fontWeight={600}

          color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <NextLink>
                <Link key={child.label} py={2} href={child.href}>
                  {child.label}
                </Link>
              </NextLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'The Problem',
    href: "/#problem"

  },
  {
    label: 'Solution',
    href: "/#solution"

  },
  {
    label: 'Crowdfunding ',
    href: "/#crowdfunding"
  },
  {
    label: 'Roadmap',
    href: "/#roadmap"

  },
  {
    label: 'Team',
    href: '/#team'

  },
  {
    label: 'Contracts',
    href: "/contracts"
  },
  {
    label: 'Campaigns',
    href: "/campaigns"
  },
  {
    label: 'Token',
    href: "/token"

  },
  {
    label: 'FAQ',
    href: '/#faq'

  },


];
export default Header
